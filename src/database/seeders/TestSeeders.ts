import { EntityManager } from '@mikro-orm/sqlite';
import { Seeder } from '@mikro-orm/seeder';
import { Channel, Message, User } from '../entities';
import { hash } from 'bcrypt';

export class ChannelsTestDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // will get persisted automatically
    const channel = em.create(Channel, {
      title: 'Welcome',
      description:
        'Welcome to my chat-app, this is the default channel all users initially join',
      default: true,
    });

    em.create(Message, {
      content: 'Hello world',
      channel: channel,
    });

    em.create(Message, {
      content: 'Another message',
      channel: channel,
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

export class AuthTestDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const hashedPassword = await hash('Password1!', 5);
    em.create(User, {
      username: 'userOne',
      password: hashedPassword,
    });
  }
}
