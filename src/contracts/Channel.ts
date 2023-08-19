import { wrap } from '@mikro-orm/core';
import { Channel } from 'src/entities';

export class ChannelDto {
  id: string;
  title: string;
  description: string;
}

export class CreateChannelDto {
  title: string;
  description: string;
}

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
