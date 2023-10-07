import {
  Collection,
  Entity,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Message } from './Message';

@Entity()
export class User extends CustomBaseEntity {
  @Property()
  @Unique()
  username: string;

  @Property({ hidden: true })
  password: string;

  constructor(username: string, password: string) {
    super();
    this.username = username;
    this.password = password;
  }

  @OneToMany({
    entity: () => Message,
    mappedBy: (message) => message.user,
  })
  messages = new Collection<Message>(this);
}
