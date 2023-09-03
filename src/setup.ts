import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

export const setupGlobalValidationPipe = (app: INestApplication) => {
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
