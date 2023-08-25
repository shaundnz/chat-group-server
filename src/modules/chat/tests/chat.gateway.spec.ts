import { Channel, Message } from '../../../database/entities';
import { ChatGateway } from '../chat.gateway';
import { ChannelsService } from '../../channels/channels.service';
import { Test } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';

type TestChannelEntity = Omit<Channel, 'createdAt' | 'updatedAt' | 'messages'>;

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;

  const mockClientSocket = {
    to: jest.fn(() => mockClientSocket),
    join: jest.fn(),
    emit: jest.fn(),
  };

  const channelEntities: TestChannelEntity[] = [
    {
      id: '1',
      title: 'Welcome channel',
      description: 'description 1',
      default: true,
    },
    {
      id: '2',
      title: 'Another channel',
      description: 'description 2',
      default: false,
    },
  ];

  const mockChannelsService = {
    getChannels: jest.fn().mockImplementation(() => channelEntities),
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
          provide: ChannelsService,
          useValue: mockChannelsService,
        },
      ],
    }).compile();

    chatGateway = moduleRef.get<ChatGateway>(ChatGateway);
  });

  it('should send a message to other all users in a channel on message:send', () => {
    chatGateway.handleEvent(mockClientSocket, {
      channelId: '1',
      content: 'hello',
    });
    expect(mockClientSocket.to).toHaveBeenCalledWith('1');
    expect(mockClientSocket.to().emit).toHaveBeenCalledWith(
      'message:received',
      { channelId: '1', message: 'hello' },
    );
  });

  it('should add a user to all channels rooms on connection', async () => {
    await chatGateway.handleConnection(mockClientSocket);
    expect(mockChannelsService.getChannels).toHaveBeenCalled();
    expect(mockClientSocket.join).toHaveBeenCalledWith(['1', '2']);
    expect(mockClientSocket.emit).toHaveBeenCalledWith('channels:joined');
  });
});
