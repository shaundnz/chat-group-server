import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from './mikro-orm.config';

@Module({
  imports: [MikroOrmModule.forRoot(config), ChatModule, ChannelsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
