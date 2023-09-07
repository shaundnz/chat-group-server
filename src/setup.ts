import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { CustomSocketIOAdapter } from './modules/chat/CustomSocketIOAdapter';

export const setupApp = (app: INestApplication) => {
  setupGlobalValidationPipe(app);
  setupCustomWebSocketAdapter(app);
};

const setupGlobalValidationPipe = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const message: { property: string; error: string }[] = [];

        validationErrors.forEach((error) => {
          const { property, constraints } = error;
          if (!constraints) return;
          for (const [, value] of Object.entries(constraints)) {
            message.push({ property, error: value });
          }
        });

        return new BadRequestException(message);
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

const setupCustomWebSocketAdapter = (app: INestApplication) => {
  app.useWebSocketAdapter(new CustomSocketIOAdapter(app));
};
