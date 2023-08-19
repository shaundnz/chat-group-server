import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Channel } from '../../../entities';
import { ChannelsService } from '../channels.service';
import { EntityManager } from '@mikro-orm/core';
import { CreateChannelDto } from 'src/contracts';

jest.mock('../../../contracts', () => ({
  ChannelMapper: {
    EntityToDto: jest.fn().mockImplementation((channel) => channel),
  },
}));

describe('ChannelsService', () => {
  let channelsService: ChannelsService;

  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(() => {
      return Promise.resolve();
    }),
  };

  const mockChannelRepository = {
    findAll: jest.fn().mockImplementation(() => {
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

    findOne: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        id: '1',
        title: 'Welcome channel',
        description: 'description 1',
      });
    }),

    create: jest
      .fn()
      .mockImplementation((createChannelDto: CreateChannelDto) => ({
        id: '1',
        title: createChannelDto.title,
        description: createChannelDto.description,
      })),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChannelsService,
        {
          provide: getRepositoryToken(Channel),
          useValue: mockChannelRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    channelsService = moduleRef.get<ChannelsService>(ChannelsService);
  });

  it('should be defined', () => {
    expect(channelsService).toBeDefined();
  });

  it('should return a list of all channels', async () => {
    const channels = await channelsService.getChannels();
    expect(channels).toHaveLength(2);
    expect(channels[0]).toHaveProperty('title', 'Welcome channel');
    expect(channels[1]).toHaveProperty('title', 'Another channel');
  });

  it('should return a channel by id if it exists', async () => {
    const channel = await channelsService.getChannelById('1');
    expect(channel).not.toBeNull();
    expect(channel).toHaveProperty('title', 'Welcome channel');
  });

  it('should return null if the channel does not exist', async () => {
    mockChannelRepository.findOne.mockImplementationOnce(() =>
      Promise.resolve(null),
    );
    const channel = await channelsService.getChannelById('1');
    expect(channel).toBeNull();
  });

  it('should create a channel', async () => {
    const createChannelDto = {
      title: 'Channel title',
      description: 'channel description',
    };
    const channel = await channelsService.createChannel(createChannelDto);
    expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
    expect(channel.id).toBe('1');
  });
});
