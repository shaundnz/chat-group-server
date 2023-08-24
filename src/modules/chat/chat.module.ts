import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChannelsModule } from '../channels/channels.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Message } from '../../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Message] }), ChannelsModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
