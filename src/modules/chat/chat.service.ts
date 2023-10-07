import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Channel, Message, User } from '../../database/entities';
import { wrap } from '@mikro-orm/core';

@Injectable()
export class ChatService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Message)
    private readonly messageRepository: EntityRepository<Message>,
    @InjectRepository(Channel)
    private readonly channelRepository: EntityRepository<Channel>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async getMessages() {
    const messages = await this.messageRepository.findAll();
    return wrap(messages);
  }

  async saveMessage(userId: string, channelId: string, content: string) {
    const user = await this.userRepository.findOne({ id: userId });
    const channel = await this.channelRepository.findOne({ id: channelId });
    if (channel === null || user === null) {
      return null;
    }

    const message = this.messageRepository.create(
      new Message(content, channel, user),
    );

    channel.messages.add(message);
    await this.em.persistAndFlush(channel);
    return message;
  }
}
