import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly eventsService: ChatService) {}

  @Get()
  async getHello() {
    return await this.eventsService.getMessages();
  }
}
