import { wrap } from '@mikro-orm/core';
import { ChannelDto } from '../contracts';
import { Channel } from '../database/entities';

export class ChannelMapper {
  static EntityToDto(channel: Channel): ChannelDto {
    const wrappedEntity = wrap(channel).toObject();
    const dto = new ChannelDto();
    dto.id = wrappedEntity.id;
    dto.title = wrappedEntity.title;
    dto.description = wrappedEntity.description;
    dto.messages = channel.messages
      .toArray()
      .sort((a, b) => a.createdAt.getDate() - b.createdAt.getDate())
      .map((message) => ({
        id: message.id,
        channelId: message.channel.id,
        createdAt: message.createdAt.toJSON(),
        content: message.content,
        user: {
          id: message.user.id,
          username: message.user.username,
        },
      }));

    return dto;
  }
}
