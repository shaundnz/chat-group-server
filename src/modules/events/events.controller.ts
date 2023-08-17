import { Controller, Get, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getHello() {
    return await this.eventsService.getMessages();
  }

  @Post()
  async postMessage() {
    return this.eventsService.createMessage();
  }
}
