import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { GraphqlModule } from './graphql/graphql.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    GraphqlModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
