import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { Channel, Message } from '../../database/entities';
import { wrap } from '@mikro-orm/core';

@Injectable()
export class ChatService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Message)
    private readonly messageRepository: EntityRepository<Message>,
    @InjectRepository(Channel)
    private readonly channelRepository: EntityRepository<Channel>,
  ) {}

  async getMessages() {
    const messages = await this.messageRepository.findAll();
    return wrap(messages);
  }

  async saveMessage(channelId: string, content: string) {
    const channel = await this.channelRepository.findOne({ id: channelId });
    if (channel == null) {
      return null;
    }

    const message = this.messageRepository.create(
      new Message(content, channel),
    );

    channel.messages.add(message);
    await this.em.persistAndFlush(channel);
    return message;
  }
}
