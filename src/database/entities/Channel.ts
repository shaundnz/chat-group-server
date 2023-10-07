import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Message } from './Message';

@Entity()
export class Channel extends CustomBaseEntity<Channel, 'default'> {
  @Property()
  title: string;

  @Property()
  description: string;

  @OneToMany({
    entity: () => Message,
    mappedBy: (message) => message.channel,
  })
  messages = new Collection<Message>(this);

  @Property()
  default: boolean = false;
}
