import * as request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatTestDatabaseSeeder } from '../src/database/seeders';
import { ChatModule } from '../src/modules/chat/chat.module';
import { ChannelsModule } from '../src/modules/channels/channels.module';
import { Socket, io } from 'socket.io-client';

describe('chat', () => {
  let app: INestApplication;
  let clientOne: Socket;
  let clientTwo: Socket;

  async function eventReception(from: Socket, event: string): Promise<void> {
    return new Promise<void>((resolve) => {
      from.on(event, () => {
        resolve();
      });
    });
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          entities: ['./dist/database/entities'],
          entitiesTs: ['./src/database/entities'],
          dbName: ':memory:',
          type: 'sqlite',
        }),
        ChatModule,
        ChannelsModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    // Setup the database
    const seeder = app.get(MikroORM).getSeeder();
    await app.get(MikroORM).getSchemaGenerator().refreshDatabase();
    await seeder.seed(ChatTestDatabaseSeeder);

    await app.listen(4000);
    await app.init();

    const appUrl = await app.getUrl();

    // Setup sockets
    clientOne = io(appUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    clientTwo = io(appUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  });

  beforeEach(async () => {});

  afterEach(() => {
    clientOne.disconnect();
    clientTwo.disconnect();
  });

  afterAll(async () => {
    await app.close();
  });

  it('on:channels:joined adds the client to all channel rooms', async () => {
    const res = await request(app.getHttpServer()).get('/channels').expect(200);
    expect(res.body).toHaveLength(3);

    const messageReceivedCallback = jest.fn((data) => {
      expect(data.message).toBe('message content');
    });

    clientTwo.on('message:received', messageReceivedCallback);

    clientOne.connect();
    clientTwo.connect();
    await eventReception(clientOne, 'channels:joined');
    await eventReception(clientTwo, 'channels:joined');

    for (const channel of res.body) {
      clientOne.emit('message:send', {
        channelId: channel.id,
        content: 'message content',
      });

      await eventReception(clientTwo, 'message:received');
    }
    expect(messageReceivedCallback).toHaveBeenCalledTimes(3);
  });
});