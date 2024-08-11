import {loadSwagger} from "@kursor/helpers/swagger/load.swagger";

process.env.TZ='UTC';

import cookieParser from 'cookie-parser';
import {Logger, ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {SubscriptionExceptionFilter} from "@kursor/backend/services/auth/permissions/subscription.exception";
import { HttpExceptionFilter } from '@kursor/nestjs-libraries/services/exception.filter';
import { GlobalExceptionFilter } from '@kursor/nestjs-libraries/services/global.exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: {
      credentials: true,
      exposedHeaders: ['reload', 'onboarding', 'activate'],
      origin: [process.env.FRONTEND_URL],
    }
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  app.use(cookieParser());
  app.useGlobalFilters(new SubscriptionExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new GlobalExceptionFilter());

  loadSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`
  );
}

bootstrap();
