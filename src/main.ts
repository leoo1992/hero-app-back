require('dotenv').config();
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nMiddleware } from 'nestjs-i18n';
import { seedAdmin } from './seeds/admin.seed';

async function bootstrap(): Promise<void> {
  const logger = new Logger();
  await seedAdmin();
  const app = await NestFactory.create(AppModule, { logger });
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(I18nMiddleware);

  const config: ConfigService = app.get(ConfigService);
  await app.listen(config.get('SERVER_PORT') as string);
  await app.startAllMicroservices();
}

void bootstrap();
