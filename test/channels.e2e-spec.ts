import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';
import { createUser, getAccessToken } from './utils';

describe('channels', () => {
  let app: INestApplication;
  let token = '';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setupApp(app);

    await app.init();

    await createUser(app, {
      username: 'channelsTestUser',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });

    token = await getAccessToken(app, {
      username: 'channelsTestUser',
      password: 'Password1!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /channels gets channels', async () => {
    const res = await request(app.getHttpServer())
      .get('/channels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBe('Welcome');
    expect(res.body[0].description).toBe(
      'Welcome to my chat-app, this is the default channel all users initially join',
    );
    expect(res.body[0].messages.length).toBeGreaterThan(0);
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
    expect(res.body.messages.length).toBeGreaterThan(0);
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
    const oldChannels = await request(app.getHttpServer())
      .get('/channels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

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
    expect(res.body.length).toBeGreaterThan(oldChannels.body.length);
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
