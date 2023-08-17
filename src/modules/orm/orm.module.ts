import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { Message } from 'src/entities';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['./dist/entities'],
      entitiesTs: ['./src/entities'],
      dbName: 'chat-app-db.sqlite3',
      type: 'sqlite',
    }),
    MikroOrmModule.forFeature({
      entities: [Message],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
