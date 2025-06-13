import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { TelegramService } from './telegram.service';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
