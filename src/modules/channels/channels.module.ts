import { Module } from '@nestjs/common';

import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Channel } from '../..//database/entities';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Channel] })],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
