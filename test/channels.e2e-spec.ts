import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { ChannelsTestDatabaseSeeder } from '../src/database/seeders';
import { AppModule } from '../src/app.module';
import { setupGlobalValidationPipe } from '../src/setup';

describe('channels', () => {
  let app: INestApplication;
  let token = '';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setupGlobalValidationPipe(app);

    // Setup the database
    const seeder = app.get(MikroORM).getSeeder();
    await app.get(MikroORM).getSchemaGenerator().refreshDatabase();
    await seeder.seed(ChannelsTestDatabaseSeeder);

    await app.init();

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'userOne',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      })
      .expect(201);
    const loggedInUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'userOne',
        password: 'Password1!',
      })
      .expect(200);

    token = loggedInUser.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /channels gets channels', async () => {
    const res = await request(app.getHttpServer())
      .get('/channels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Welcome');
    expect(res.body[0].description).toBe(
      'Welcome to my chat-app, this is the default channel all users initially join',
    );
    expect(res.body[0].messages).toHaveLength(2);
  });

  it('GET /channels/default gets the default channel', async () => {
    const res = await request(app.getHttpServer())
      .get('/channels/default')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.title).toBe('Welcome');
    expect(res.body.description).toBe(
      'Welcome to my chat-app, this is the default channel all users initially join',
    );
    expect(res.body.messages).toHaveLength(2);
  });

  it('GET /channels/:id gets channel by id', async () => {
    const res = await request(app.getHttpServer())
      .get('/channels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/channels/${res.body[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('GET /channels/:id returns 404 if channel does not exist', async () => {
    await request(app.getHttpServer())
      .get('/channels/123')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('POST /channels creates a new channel', async () => {
    const newChannelRes = await request(app.getHttpServer())
      .post('/channels')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'new channel', description: 'new channel description' })
      .expect(201);

    expect(newChannelRes.body.title).toBe('new channel');
    expect(newChannelRes.body.description).toBe('new channel description');

    const res = await request(app.getHttpServer())
      .get('/channels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
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
    await request(app.getHttpServer())
      .post('/channels')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(400);
  });
});
