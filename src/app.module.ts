import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { OrmModule } from './modules/orm/orm.module';
import { ChannelsModule } from './modules/channels/channels.module';

@Module({
  imports: [OrmModule, ChatModule, ChannelsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
