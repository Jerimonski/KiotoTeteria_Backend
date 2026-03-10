import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const port = process.env.PORT ?? 3000;
    await app.listen(port);

    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    console.error('❌ Error starting app:', err);
    process.exit(1);
  }
}

bootstrap();
