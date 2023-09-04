import { Entity, Property, Unique } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';

@Entity()
export class User extends CustomBaseEntity {
  @Property()
  @Unique()
  username: string;

  @Property()
  password: string;

  constructor(username: string, password: string) {
    super();
    this.username = username;
    this.password = password;
  }
}
