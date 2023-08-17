import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './modules/events/events.module';
import { OrmModule } from './modules/orm/orm.module';

@Module({
  imports: [OrmModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
