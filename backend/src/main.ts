 import { ValidationPipe } from '@nestjs/common';
  import { NestFactory } from '@nestjs/core';

  import { AppModule } from './app.module';
  import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';

  async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
  
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    app.enableShutdownHooks();
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  }

  void bootstrap();