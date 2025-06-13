import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [ConfigModule.forFeature(configuration), TelegramModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class GraphqlModule {}
