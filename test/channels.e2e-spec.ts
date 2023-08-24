import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ChannelsModule } from '../src/modules/channels/channels.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { ChannelsTestDatabaseSeeder } from '../src/database/seeders';

describe('channels', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ChannelsModule,
        MikroOrmModule.forRoot({
          entities: ['./dist/database/entities'],
          entitiesTs: ['./src/database/entities'],
          dbName: ':memory:',
          type: 'sqlite',
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    // Setup the database
    const seeder = app.get(MikroORM).getSeeder();
    await app.get(MikroORM).getSchemaGenerator().refreshDatabase();
    await seeder.seed(ChannelsTestDatabaseSeeder);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /channels gets channels', async () => {
    const res = await request(app.getHttpServer()).get('/channels').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Welcome');
    expect(res.body[0].description).toBe(
      'Welcome to my chat-app, this is the default channel all users initially join',
    );
  });

  it('GET /channels/default gets the default channel', async () => {
    const res = await request(app.getHttpServer())
      .get('/channels/default')
      .expect(200);
    expect(res.body.title).toBe('Welcome');
    expect(res.body.description).toBe(
      'Welcome to my chat-app, this is the default channel all users initially join',
    );
  });

  it('GET /channels/:id gets channel by id', async () => {
    const res = await request(app.getHttpServer()).get('/channels').expect(200);
    await request(app.getHttpServer())
      .get(`/channels/${res.body[0].id}`)
      .expect(200);
  });

  it('GET /channels/:id returns 404 if channel does not exist', async () => {
    await request(app.getHttpServer()).get('/channels/123').expect(404);
  });

  it('POST /channels creates a new channel', async () => {
    const newChannelRes = await request(app.getHttpServer())
      .post('/channels')
      .send({ title: 'new channel', description: 'new channel description' })
      .expect(201);

    expect(newChannelRes.body.title).toBe('new channel');
    expect(newChannelRes.body.description).toBe('new channel description');

    const res = await request(app.getHttpServer()).get('/channels').expect(200);
    expect(res.body).toHaveLength(2);
  });

  it.each([
    {},
    { title: 'title only' },
    { description: 'description only' },
    { title: '', description: '' },
    { title: 'title', description: '' },
    { title: '', description: 'description' },
  ])('POST /channels throws validation errors for bad data', async (body) => {
    await request(app.getHttpServer()).post('/channels').send(body).expect(400);
  });
});
