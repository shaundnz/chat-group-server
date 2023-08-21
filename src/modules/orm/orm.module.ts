import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Message, Channel } from '../../database/entities';
import mikroOrmConfig from '../../mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    MikroOrmModule.forFeature({
      entities: [Message, Channel],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
