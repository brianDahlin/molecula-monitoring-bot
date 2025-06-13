import { Injectable, Logger } from '@nestjs/common';
import { Telegram } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { formatMessage } from '../constants';

@Injectable()
export class TelegramService {
  private readonly tg: Telegram;
  private readonly chatId: string;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private config: ConfigService) {
    const token = this.config.getOrThrow<string>('app.telegramToken');
    this.chatId = this.config.getOrThrow<string>('app.telegramChatId');
    this.tg = new Telegram(token);
  }

  async sendMessage(event: any) {
    const text = formatMessage(event);
    try {
      await this.tg.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
      this.logger.log(`Message sent: ${event.transaction}`);
    } catch (err) {
      this.logger.error('Failed to send Telegram message', err as Error);
    }
  }
}
