require('dotenv').config();
import 'module-alias/register';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedAdmin } from './seeds/admin.seed';
import { ConfigService } from '@nestjs/config';
import helmet from '@fastify/helmet';
import csrf from '@fastify/csrf-protection';
import cookie from '@fastify/cookie';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap(): Promise<void> {
  const logger = new Logger();
  await seedAdmin();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger,
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: configService.get('CLIENT_ORIGIN'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {},
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(csrf);

  const config = new DocumentBuilder()
    .setTitle('API HeroForce')
    .setDescription('Documentação da API HeroForce')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('SERVER_PORT') || 3001;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
