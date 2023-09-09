import * as request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatTestDatabaseSeeder } from '../src/database/seeders';
import { Socket, io } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';
import { createUser, getAccessToken } from './utils';

describe('chat', () => {
  let app: INestApplication;
  let clientOne: Socket;
  let userOneAccessToken = '';
  let clientTwo: Socket;
  let userTwoAccessToken = '';

  async function eventReception(from: Socket, event: string): Promise<void> {
    return new Promise<void>((resolve) => {
      from.on(event, () => {
        resolve();
      });
    });
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setupApp(app);

    // Setup the database
    const seeder = app.get(MikroORM).getSeeder();
    await app.get(MikroORM).getSchemaGenerator().refreshDatabase();
    await seeder.seed(ChatTestDatabaseSeeder);

    await app.listen(3000);
    await app.init();

    const appUrl = 'http://localhost:3000';

    const userOne = {
      username: 'userOne',
      password: 'Password1!',
    };

    const userTwo = {
      username: 'userTwo',
      password: 'Password2@',
    };

    await createUser(app, { ...userOne, confirmPassword: userOne.password });
    await createUser(app, { ...userTwo, confirmPassword: userTwo.password });

    userOneAccessToken = await getAccessToken(app, userOne);
    userTwoAccessToken = await getAccessToken(app, userTwo);

    // Setup sockets
    clientOne = io(appUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: {
        token: userOneAccessToken,
      },
    });

    clientOne.on('connect_error', (err) => {
      throw new Error(err.message);
    });

    clientTwo = io(appUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: {
        token: userTwoAccessToken,
      },
    });

    clientTwo.on('connect_error', (err) => {
      throw new Error(err.message);
    });
  });

  afterEach(async () => {
    clientOne.disconnect();
    clientTwo.disconnect();
  });

  afterAll(async () => {
    await app.close();
  });

  it('on:channels:joined adds the client to all channel rooms', async () => {
    const res = await request(app.getHttpServer())
      .get('/channels')
      .set('Authorization', `Bearer ${userOneAccessToken}`)
      .expect(200);
    expect(res.body).toHaveLength(3);

    const messageReceivedCallback = jest.fn((data) => {
      expect(data.content).toBe('message content');
    });

    clientTwo.on('message:received', messageReceivedCallback);

    clientOne.connect();
    clientTwo.connect();
    await Promise.all([
      eventReception(clientOne, 'channels:joined'),
      eventReception(clientTwo, 'channels:joined'),
    ]);

    for (const channel of res.body) {
      clientOne.emit('message:send', {
        channelId: channel.id,
        content: 'message content',
      });

      await Promise.all([
        eventReception(clientTwo, 'message:received'),
        eventReception(clientOne, 'message:send'),
      ]);
    }
    expect(messageReceivedCallback).toHaveBeenCalledTimes(3);
  });

  it('on:message:send saves the message to the database', async () => {
    const newChannelRes = await request(app.getHttpServer())
      .post('/channels')
      .set('Authorization', `Bearer ${userOneAccessToken}`)
      .send({ title: 'new channel', description: 'new channel description' })
      .expect(201);

    clientOne.connect();
    clientOne.emit('message:send', {
      channelId: newChannelRes.body.id,
      content: 'new message',
    });

    await eventReception(clientOne, 'message:send');

    const channelRes = await request(app.getHttpServer())
      .get(`/channels/${newChannelRes.body.id}`)
      .set('Authorization', `Bearer ${userOneAccessToken}`)
      .expect(200);

    expect(channelRes.body.messages).toHaveLength(1);
    expect(channelRes.body.messages[0].content).toBe('new message');
  });

  it('channel:created event is emitted to all connected clients when a new channel is created', async () => {
    const channelCreatedCallback = jest.fn().mockImplementation();

    clientOne.on('channel:created', channelCreatedCallback);
    clientTwo.on('channel:created', channelCreatedCallback);

    clientOne.connect();
    clientTwo.connect();
    await Promise.all([
      eventReception(clientOne, 'channels:joined'),
      eventReception(clientTwo, 'channels:joined'),
    ]);

    const res = await Promise.all([
      request(app.getHttpServer())
        .post('/channels')
        .send({ title: 'new channel', description: 'new channel description' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(201),
      eventReception(clientOne, 'channel:created'),
      eventReception(clientTwo, 'channel:created'),
    ]);

    expect(channelCreatedCallback).toHaveBeenCalledTimes(2);
    expect(channelCreatedCallback).toHaveBeenCalledWith({
      channelId: res[0].body.id,
    });
  });

  it('when a channel is created, user is added to the channel room', async () => {
    clientOne.connect();
    clientTwo.connect();
    await Promise.all([
      eventReception(clientOne, 'channels:joined'),
      eventReception(clientTwo, 'channels:joined'),
    ]);

    const res = await Promise.all([
      request(app.getHttpServer())
        .post('/channels')
        .send({ title: 'new channel', description: 'new channel description' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(201),
      eventReception(clientOne, 'channel:created'),
      eventReception(clientTwo, 'channel:created'),
    ]);

    clientOne.emit('message:send', {
      channelId: res[0].body.id,
      content: 'message content',
    });

    await Promise.all([
      eventReception(clientTwo, 'message:received'),
      eventReception(clientOne, 'message:send'),
    ]);
  });

  it('socket cannot connect without a valid access token', async () => {
    clientOne.auth = {
      token: '',
    };

    // Don't throw error for this test
    clientOne.off('connect_error');

    clientOne.connect();
    await eventReception(clientOne, 'connect_error');

    // Reset properties and listeners for future tests
    clientOne.auth = {
      token: userOneAccessToken,
    };
    clientOne.on('connect_error', (err) => {
      throw new Error(err.message);
    });
  });
});
