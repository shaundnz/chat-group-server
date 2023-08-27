import { wrap } from '@mikro-orm/core';
import { IsNotEmpty, IsString } from 'class-validator';
import { Channel } from 'src/database/entities';

export class ChannelDto {
  id: string;
  title: string;
  description: string;
}

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
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
