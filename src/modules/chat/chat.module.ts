import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Message, Channel } from '../../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Message, Channel] })],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
})
export class ChatModule {}
