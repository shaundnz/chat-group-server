import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import { setupApp } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://127.0.0.1:4173',
      'http://localhost:4173',
    ],
  });

  app.setGlobalPrefix('/api');

  setupApp(app);

  // Setup the database if we are in dev
  if (process.env.NODE_ENV === 'development') {
    await app.get(MikroORM).getSchemaGenerator().ensureDatabase();
    await app.get(MikroORM).getSchemaGenerator().updateSchema();
  }
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
