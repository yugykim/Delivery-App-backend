import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); //make class validation working
  app.enableCors();
  // app.use(JwtMiddleware); it is only for functional middleware
  await app.listen(4000);
}
bootstrap();
