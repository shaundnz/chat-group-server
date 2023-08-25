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
    return dto;
  }
}
