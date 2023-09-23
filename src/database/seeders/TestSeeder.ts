import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Channel, Message, User } from '../entities';
import { hash } from 'bcrypt';

export class TestSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    return this.call(em, [
      ChannelsTestDatabaseSeeder,
      ChatTestDatabaseSeeder,
      AuthTestDatabaseSeeder,
    ]);
  }
}

class ChannelsTestDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
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

class ChatTestDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
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

class AuthTestDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const hashedPassword = await hash('Password1!', 5);
    em.create(User, {
      username: 'userOne',
      password: hashedPassword,
    });
  }
}
