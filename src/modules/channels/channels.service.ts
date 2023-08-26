import { EntityRepository, EntityManager } from '@mikro-orm/sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { ChannelDto, CreateChannelDto } from '../../contracts';
import { ChannelMapper } from '../../mappers';
import { Channel } from '../../database/entities';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Channel)
    private readonly channelRepository: EntityRepository<Channel>,
  ) {}

  async getChannels(): Promise<ChannelDto[]> {
    const channels = await this.channelRepository.findAll({
      populate: ['messages'],
    });
    return channels.map((channel) => ChannelMapper.EntityToDto(channel));
  }

  async getChannelById(id: string): Promise<ChannelDto | null> {
    const channel = await this.channelRepository.findOne(
      { id: id },
      {
        populate: ['messages'],
      },
    );

    if (channel === null) {
      return null;
    }

    return ChannelMapper.EntityToDto(channel);
  }

  async getDefaultChannel(): Promise<ChannelDto | null> {
    const channel = await this.channelRepository.findOne(
      { default: true },
      {
        populate: ['messages'],
      },
    );
    if (channel === null) {
      return null;
    }
    return ChannelMapper.EntityToDto(channel);
  }

  async createChannel(createChannelDto: CreateChannelDto): Promise<ChannelDto> {
    const channel = this.channelRepository.create(createChannelDto);
    await this.em.persistAndFlush(channel);
    return ChannelMapper.EntityToDto(channel);
  }
}
