import { EntityManager } from '@mikro-orm/sqlite';
import { Seeder } from '@mikro-orm/seeder';
import { Channel } from '../entities';

export class DatabaseSeeder extends Seeder {
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

export class TestDatabaseSeeder extends Seeder {
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
