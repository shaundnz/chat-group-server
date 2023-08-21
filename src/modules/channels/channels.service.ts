import { EntityRepository } from '@mikro-orm/sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ChannelDto, ChannelMapper, CreateChannelDto } from '../../contracts';
import { Channel } from '../../database/entities';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Channel)
    private readonly channelRepository: EntityRepository<Channel>,
  ) {}

  async getChannels(): Promise<ChannelDto[]> {
    const channels = await this.channelRepository.findAll();
    return channels.map((channel) => ChannelMapper.EntityToDto(channel));
  }

  async getChannelById(id: string): Promise<ChannelDto | null> {
    const channel = await this.channelRepository.findOne({ id: id });

    if (channel === null) {
      return null;
    }

    return ChannelMapper.EntityToDto(channel);
  }

  async getDefaultChannel(): Promise<ChannelDto> {
    const channel = await this.channelRepository.findOne({ title: 'Welcome' });
    if (channel === null) {
      return await this.createChannel({
        title: 'Welcome',
        description:
          'Welcome to my chat-app, this is the default channel all users initially join',
      });
    }
    return ChannelMapper.EntityToDto(channel);
  }

  async createChannel(createChannelDto: CreateChannelDto): Promise<ChannelDto> {
    const channel = this.channelRepository.create(createChannelDto);
    await this.em.persistAndFlush(channel);
    return ChannelMapper.EntityToDto(channel);
  }
}
