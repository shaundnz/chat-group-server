import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { OrmModule } from '../orm/orm.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [OrmModule],
  controllers: [EventsController],
  providers: [EventsGateway, EventsService],
})
export class EventsModule {}
