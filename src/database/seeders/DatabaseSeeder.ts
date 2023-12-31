import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/postgresql';
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
