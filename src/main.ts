import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*', // Разрешить запросы с любого домена
    methods: ['GET', 'POST'], // Допустимые HTTP-методы
    credentials: true, // Если используются cookies
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
