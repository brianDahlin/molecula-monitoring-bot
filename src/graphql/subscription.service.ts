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
    const QA_ADDRESSES = new Set([
      '0xffccfc78c1883a84903688fe0294f7cb075e5fc4',
      '0xe8b1698c60752522d06a577c1e69c692d27f6bda',
      '0x10a4ac6e354d22df51308ed3f3b67d566e4275e8',
      '0xd1b3a474c3d0420813d23fd4cf2f7e91296d3ad2',
      '0x37ddf1ffa56ea8c0cbcd93ce96a5b8e7885bc1b',
    ]);

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
          this.logger.warn('Received empty operation, skipping');
          continue;
        }

        const from = op.from.toLowerCase();
        const to = op.to.toLowerCase();

        // If the operation originates from or is sent to a QA address, skip it
        if (QA_ADDRESSES.has(from) || QA_ADDRESSES.has(to)) {
          this.logger.debug(
            `Skipping QA operation: from=${op.from}, to=${op.to}`,
          );
          continue;
        }

        // Skip duplicate operations based on transaction hash
        if (this.sentTx.has(op.transaction)) {
          this.logger.debug(`Skipping duplicate operation: ${op.transaction}`);
          continue;
        }
        this.sentTx.add(op.transaction);

        // Process and forward the new operation to Telegram
        this.logger.debug(
          `Processing new operation: ${op.transaction} type=${op.type}`,
        );
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
