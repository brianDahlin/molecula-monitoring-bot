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

// wrapping the GraphQL response
interface TokenOperationResponse {
  tokenOperations: TokenOperation;
}

@Injectable()
export class SubscriptionService implements OnModuleInit, OnModuleDestroy {
  private client!: Client;
  private readonly logger = new Logger(SubscriptionService.name);
  private sentTx = new Set<string>();

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
    const filter = {};
    const payload: SubscribePayload = {
      query: GQL_SUBSCRIPTION,
      variables: { filter },
    };

    // Get async iterator per graphql-ws guide
    const iterable = this.client.iterate<TokenOperationResponse>(payload);

    try {
      for await (const item of iterable) {
        const op = item.data?.tokenOperations;
        if (!op) {
          this.logger.warn('Received empty data in subscription');
          continue;
        }
        // Deduplicate by transaction hash
        if (this.sentTx.has(op.transaction)) {
          this.logger.debug(`Skipping duplicate op: ${op.transaction}`);
          continue;
        }
        this.sentTx.add(op.transaction);

        this.logger.debug(`New op: ${op.transaction} type=${op.type}`);
        await this.telegram.sendMessage(op);
      }
    } catch (err) {
      this.logger.error('Subscription loop error', err as Error);
    }
  }

  onModuleDestroy() {
    this.client.dispose();
    this.logger.log('GraphQL-WS client disposed');
  }
}
