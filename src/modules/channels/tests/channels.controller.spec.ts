import { Test, TestingModule } from '@nestjs/testing';
import { CreateChannelDto } from '../../../contracts';
import { ChannelsController } from '../channels.controller';
import { ChannelsService } from '../channels.service';
import { NotFoundException } from '@nestjs/common';

describe('ChannelsController', () => {
  let controller: ChannelsController;

  const mockChannelsService = {
    getChannels: jest.fn().mockImplementation(() => {
      return Promise.resolve([
        {
          id: '1',
          title: 'Welcome channel',
          description: 'description 1',
        },
        {
          id: '2',
          title: 'Another channel',
          description: 'description 2',
        },
      ]);
    }),

    getChannelById: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        id: '1',
        title: 'Welcome channel',
        description: 'description 1',
      });
    }),

    createChannel: jest
      .fn()
      .mockImplementation((createChannelDto: CreateChannelDto) => {
        return Promise.resolve({
          id: '1',
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
    expect(channels[0]).toHaveProperty('title', 'Welcome channel');
    expect(channels[1]).toHaveProperty('title', 'Another channel');
  });

  it('should get a channel by id', async () => {
    const channel = await controller.getChannel('1');
    expect(channel).not.toBeNull();
    expect(channel).toHaveProperty('title', 'Welcome channel');
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
