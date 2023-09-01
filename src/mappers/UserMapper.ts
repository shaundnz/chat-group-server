import { wrap } from '@mikro-orm/core';
import { UserDto } from '../contracts';
import { User } from '../database/entities';

export class UserMapper {
  static EntityToDto(user: User): UserDto {
    const wrappedEntity = wrap(user).toObject();
    const dto = new UserDto();
    dto.id = wrappedEntity.id;
    dto.username = wrappedEntity.username;
    return dto;
  }
}
