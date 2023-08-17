import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { Message } from 'src/entities';

@Injectable()
export class EventsService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Message)
    private readonly messageRepository: EntityRepository<Message>,
  ) {}

  async getMessages() {
    return await this.messageRepository.findAll();
  }

  async createMessage() {
    const message = this.messageRepository.create(
      new Message('Hello this is my message'),
    );
    await this.em.persistAndFlush(new Message('Hello this is my message'));
    return message;
  }
}
