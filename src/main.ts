import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: AppLogger,
  });
  AppLogger.log('Bot Monitor application initialized');
}
bootstrap().catch((err) => AppLogger.error('Bootstrap failed', err));
