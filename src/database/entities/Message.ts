import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Channel } from './Channel';
import { User } from './User';

@Entity()
export class Message extends CustomBaseEntity {
  @Property()
  content: string;

  @ManyToOne({
    entity: () => Channel,
  })
  channel: Channel;

  @ManyToOne({
    entity: () => User,
  })
  user: User;

  constructor(content: string, channel: Channel, user: User) {
    super();
    this.content = content;
    this.channel = channel;
    this.user = user;
  }
}
