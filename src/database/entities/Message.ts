import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Channel } from './Channel';

@Entity()
export class Message extends CustomBaseEntity {
  @Property()
  content: string;

  @ManyToOne({
    entity: () => Channel,
    serializer: (value) => value.id,
    serializedName: 'channelId',
  })
  channel: Channel;

  constructor(content: string) {
    super();
    this.content = content;
  }
}
