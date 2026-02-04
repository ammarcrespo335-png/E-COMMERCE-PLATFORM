import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import 'dotenv/config';
import { SuccessHandleInterceptor } from './common/interceptors/morgan.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // لاجل الbuffer بتاع الpayload في الwebHook//
  });
  const port = Number(process.env.PORT || 5000);
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000'
      ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalInterceptors(new SuccessHandleInterceptor());

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(port);
  console.log('server is running on port', port);
}
void bootstrap();
