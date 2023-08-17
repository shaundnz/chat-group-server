import { Entity, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';

@Entity()
export class Message extends CustomBaseEntity {
  @Property()
  content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }
}
