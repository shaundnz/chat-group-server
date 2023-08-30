import { Channel, Message } from '../../../database/entities';
import { ChatGateway } from '../chat.gateway';
import { Test } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { Server } from 'socket.io';
import { ChannelDto } from '../../../contracts';
import { ChatService } from '../chat.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;
  const now = new Date();

  const mockClientSocket = {
    to: jest.fn(() => mockClientSocket),
    join: jest.fn(),
    emit: jest.fn(),
  };

  const sockets = [
    { id: '1', join: jest.fn() },
    { id: '2', join: jest.fn() },
  ];

  const mockServer = {
    emit: jest.fn(),
    fetchSockets: jest
      .fn()
      .mockImplementation(async () => Promise.resolve(sockets)),
  };

  const channels: ChannelDto[] = [
    {
      id: '1',
      title: 'Welcome channel',
      description: 'description 1',
      messages: [],
    },
    {
      id: '2',
      title: 'Another channel',
      description: 'description 2',
      messages: [],
    },
  ];

  const mockChannelsRepository = {
    findAll: jest.fn().mockImplementation(() => channels),
  };

  const mockChatService = {
    saveMessage: jest
      .fn()
      .mockImplementation((channelId: string, content: string) => ({
        channelId,
        content,
        createdAt: now,
      })),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: MikroORM,
          useValue: MikroORM.init({
            connect: false,
            dbName: 'test',
            entities: [Message],
            type: 'sqlite',
          }),
        },
        {
          provide: getRepositoryToken(Channel),
          useValue: mockChannelsRepository,
        },
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    chatGateway = moduleRef.get<ChatGateway>(ChatGateway);
    chatGateway.server = mockServer as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a message to other all users in a channel on message:send', async () => {
    await chatGateway.handleEvent(mockClientSocket, {
      channelId: '1',
      content: 'hello',
    });
    expect(mockClientSocket.to).toHaveBeenCalledWith('1');
    expect(mockClientSocket.to().emit).toHaveBeenCalledWith(
      'message:received',
      { channelId: '1', content: 'hello', createdAt: now },
    );
  });

  it('should save the message on message:send', async () => {
    await chatGateway.handleEvent(mockClientSocket, {
      channelId: '1',
      content: 'hello',
    });
    expect(mockChatService.saveMessage).toHaveBeenCalledWith('1', 'hello');
  });

  it('should add a user to all channels rooms on connection', async () => {
    await chatGateway.handleConnection(mockClientSocket);
    expect(mockChannelsRepository.findAll).toHaveBeenCalled();
    expect(mockClientSocket.join).toHaveBeenCalledWith(['1', '2']);
    expect(mockClientSocket.emit).toHaveBeenCalledWith('channels:joined');
  });

  it('should all all active clients to the channel room when a channel is created', async () => {
    const newChannelDto = {
      id: '1',
      title: 'New channel',
      description: 'Some info',
      messages: [],
    };
    await chatGateway.handleActiveClientsOnNewChannelCreated(newChannelDto);
    sockets.forEach((socket) => {
      expect(socket.join).toHaveBeenCalled();
    });
  });

  it('should send out a message to all clients when a channel is created', async () => {
    const newChannelDto = {
      id: '1',
      title: 'New channel',
      description: 'Some info',
      messages: [],
    };
    await chatGateway.handleActiveClientsOnNewChannelCreated(newChannelDto);
    expect(chatGateway.server.emit).toHaveBeenCalledWith('channel:created', {
      channelId: '1',
    });
  });
});
