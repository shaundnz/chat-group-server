import { PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export abstract class CustomBaseEntity {
  @PrimaryKey()
  id = v4();

  @Property({ length: 3 })
  createdAt: Date = new Date();

  @Property({ length: 3, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
