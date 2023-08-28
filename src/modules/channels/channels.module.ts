import { Module } from '@nestjs/common';

import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Channel } from '../..//database/entities';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Channel] }), ChatModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
