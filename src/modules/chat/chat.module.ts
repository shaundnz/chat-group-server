import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { OrmModule } from '../orm/orm.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [OrmModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
