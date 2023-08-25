import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Channel } from '../../../database/entities';
import { ChannelsService } from '../channels.service';
import { EntityManager } from '@mikro-orm/sqlite';
import { CreateChannelDto } from '../../../contracts';

jest.mock('../../../mappers', () => ({
  ChannelMapper: {
    EntityToDto: jest.fn().mockImplementation((channel) => channel),
  },
}));

type TestChannelEntity = Omit<Channel, 'createdAt' | 'updatedAt' | 'messages'>;

describe('ChannelsService', () => {
  let channelsService: ChannelsService;

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

  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(() => {
      return Promise.resolve();
    }),
  };

  const mockChannelRepository = {
    findAll: jest.fn().mockImplementation(() => {
      return Promise.resolve(channelEntities);
    }),

    findOne: jest.fn().mockImplementation(({ id }: { id: string }) => {
      return Promise.resolve(
        channelEntities.find((channel) => channel.id === id),
      );
    }),

    create: jest
      .fn()
      .mockImplementation((createChannelDto: CreateChannelDto) => ({
        id: '123-456',
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
    expect(channels).toEqual(channelEntities);
  });

  it('should return the default channel if it exists', async () => {
    mockChannelRepository.findOne.mockImplementationOnce(
      () => channelEntities[0],
    );
    const channel = await channelsService.getDefaultChannel();
    expect(mockChannelRepository.findOne).toHaveBeenCalledWith({
      default: true,
    });
    expect(channel).not.toBeNull();
    expect(channel).toEqual(channelEntities[0]);
  });

  it('should return null if the default channel does not exists', async () => {
    mockChannelRepository.findOne.mockImplementationOnce(() => null);
    const channel = await channelsService.getDefaultChannel();
    expect(mockChannelRepository.findOne).toHaveBeenCalledWith({
      default: true,
    });
    expect(channel).toBeNull();
  });

  it('should return a channel by id if it exists', async () => {
    const channel = await channelsService.getChannelById('1');
    expect(channel).not.toBeNull();
    expect(channel).toEqual(channelEntities[0]);
  });

  it('should return null if the channel does not exist', async () => {
    mockChannelRepository.findOne.mockImplementationOnce(() =>
      Promise.resolve(null),
    );
    const channel = await channelsService.getChannelById('3');
    expect(channel).toBeNull();
  });

  it('should create a channel', async () => {
    const createChannelDto = {
      title: 'Channel title',
      description: 'channel description',
    };
    const channel = await channelsService.createChannel(createChannelDto);
    expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
    expect(channel.id).toBe('123-456');
    expect(channel.title).toBe(createChannelDto.title);
  });
});
