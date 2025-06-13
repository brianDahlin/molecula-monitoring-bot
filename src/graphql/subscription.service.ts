import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { createClient, Client, SubscribePayload } from 'graphql-ws';
import { TelegramService } from '../telegram/telegram.service';
import { GQL_SUBSCRIPTION } from '../constants';
import { TokenOperation } from './types/token-operation.type';

// обёртка ответа GraphQL
interface TokenOperationResponse {
  tokenOperations: TokenOperation;
}

@Injectable()
export class SubscriptionService implements OnModuleInit, OnModuleDestroy {
  private client!: Client;
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramService,
  ) {}

  onModuleInit() {
    const url = this.config.getOrThrow<string>('app.graphqlWsUrl');
    this.client = createClient({
      url,
      webSocketImpl: WebSocket,
      retryAttempts: 5,
      shouldRetry: () => true,
    });

    this.logger.log(`Connecting GraphQL-WS client to ${url}`);
    this.startSubscription();
  }

  private async startSubscription() {
    this.logger.log('>>> START SUBSCRIPTION LOOP');
    console.log('>>> START SUBSCRIPTION LOOP');
    const filter = {};
    const payload: SubscribePayload = {
      query: GQL_SUBSCRIPTION,
      variables: { filter },
    };

    // асинхронный итератор (делал погайду @graphql-ws вроде воркает :D)
    const iterable = this.client.iterate<TokenOperationResponse>(payload);

    try {
      for await (const item of iterable) {
        const op = item.data?.tokenOperations;
        if (!op) {
          this.logger.warn('Received empty data in subscription');
          continue;
        }
        this.logger.debug(`New op: ${op.transaction} type=${op.type}`);
        await this.telegram.sendMessage(op);
      }
    } catch (err) {
      this.logger.error('Subscription loop error', err as Error);
      // можно добавить логику реконнекта или экспоненциальный бэкофф, но мне кажется, что graphql-ws сам справится с этим
    }
  }

  onModuleDestroy() {
    this.client.dispose();
    this.logger.log('GraphQL-WS client disposed');
  }
}
