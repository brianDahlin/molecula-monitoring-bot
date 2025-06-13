import { registerAs } from '@nestjs/config';
import { ENV } from '../constants';

export default registerAs('app', () => ({
  graphqlWsUrl: process.env[ENV.GRAPHQL_WS_URL],
  contractAddress: process.env[ENV.CONTRACT_ADDRESS],
  telegramToken: process.env[ENV.TELEGRAM_BOT_TOKEN],
  telegramChatId: process.env[ENV.TELEGRAM_CHAT_ID],
}));
