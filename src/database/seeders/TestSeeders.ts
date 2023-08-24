import { EntityManager } from '@mikro-orm/sqlite';
import { Seeder } from '@mikro-orm/seeder';
import { Channel } from '../entities';

export class ChannelsTestDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // will get persisted automatically
    em.create(Channel, {
      title: 'Welcome',
      description:
        'Welcome to my chat-app, this is the default channel all users initially join',
      default: true,
    });
  }
}

export class ChatTestDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // will get persisted automatically
    em.create(Channel, {
      title: 'Welcome',
      description:
        'Welcome to my chat-app, this is the default channel all users initially join',
      default: true,
    });

    em.create(Channel, {
      title: 'Channel 2',
      description: 'Description 2',
    });

    em.create(Channel, {
      title: 'Channel 3',
      description: 'Description 3',
    });
  }
}
