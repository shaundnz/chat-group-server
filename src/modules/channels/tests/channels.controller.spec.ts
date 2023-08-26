import { Test, TestingModule } from '@nestjs/testing';
import { ChannelDto, CreateChannelDto } from '../../../contracts';
import { ChannelsController } from '../channels.controller';
import { ChannelsService } from '../channels.service';
import { NotFoundException } from '@nestjs/common';

describe('ChannelsController', () => {
  let controller: ChannelsController;
  const initialChannels: ChannelDto[] = [
    {
      id: '1',
      title: 'Welcome channel',
      description: 'description 1',
      messages: [
        {
          id: '3',
          channelId: '1',
          createdAt: new Date().toJSON(),
          content: 'hello',
        },
      ],
    },
    {
      id: '2',
      title: 'Another channel',
      description: 'description 2',
      messages: [
        {
          id: '4',
          channelId: '2',
          createdAt: new Date().toJSON(),
          content: 'world',
        },
      ],
    },
  ];

  const mockChannelsService = {
    getChannels: jest.fn().mockImplementation(() => {
      return Promise.resolve(initialChannels);
    }),

    getDefaultChannel: jest.fn().mockImplementation(() => {
      return Promise.resolve(initialChannels[0]);
    }),

    getChannelById: jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(
        initialChannels.find((channel) => channel.id === id),
      );
    }),

    createChannel: jest
      .fn()
      .mockImplementation((createChannelDto: CreateChannelDto) => {
        return Promise.resolve({
          id: '123-456',
          title: createChannelDto.title,
          description: createChannelDto.description,
        });
      }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsController],
      providers: [
        {
          provide: ChannelsService,
          useValue: mockChannelsService,
        },
      ],
    }).compile();

    controller = module.get<ChannelsController>(ChannelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get channels', async () => {
    const channels = await controller.getAllChannels();
    expect(channels).toHaveLength(2);
    expect(channels).toEqual(initialChannels);
  });

  it('should get the default channel', async () => {
    const defaultChannel = await controller.getDefaultChannel();
    expect(defaultChannel).toEqual(initialChannels[0]);
  });

  it('should throw a 404 error if the default channel does not exist', async () => {
    mockChannelsService.getDefaultChannel.mockImplementationOnce(() =>
      Promise.resolve(null),
    );
    await expect(controller.getDefaultChannel()).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('should get a channel by id', async () => {
    const channel = await controller.getChannel('2');
    expect(channel).not.toBeNull();
    expect(channel).toEqual(initialChannels[1]);
  });

  it('should throw a 404 error if the channel does not exist', async () => {
    mockChannelsService.getChannelById.mockImplementationOnce(() =>
      Promise.resolve(null),
    );
    await expect(controller.getChannel('1')).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('should create a channel', async () => {
    const createChannelDto = {
      title: 'New channel',
      description: 'New channel description',
    };
    const newChannel = await controller.createChannel(createChannelDto);
    expect(newChannel.title).toBe(createChannelDto.title);
    expect(mockChannelsService.createChannel).toHaveBeenCalledWith(
      createChannelDto,
    );
  });
});
