import { formatUnits } from 'ethers';

export const ENV = {
  GRAPHQL_WS_URL: 'GRAPHQL_WS_URL',
  CONTRACT_ADDRESS: 'CONTRACT_ADDRESS',
  TELEGRAM_BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
  TELEGRAM_CHAT_ID: 'TELEGRAM_CHAT_ID',
};

export const GQL_SUBSCRIPTION = `
subscription TokenEvents($filter: TokenOperationsFilter!) {
  tokenOperations(filter: $filter) {
    _id
    transaction
    created
    from
    to
    value
    type
  }
}
`;

// сокращаем адрес до первых и последних символов
function shortenAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatMessage(event: any): string {
  const date = new Date(event.created).toLocaleString();
  const rawValue = formatUnits(event.value, 18);
  const humanValue = Number(rawValue).toFixed(4);

  // линки на Etherscan
  const txLink = `https://etherscan.io/tx/${event.transaction}`;
  const fromLink = `https://etherscan.io/address/${event.from}`;
  const toLink = `https://etherscan.io/address/${event.to}`;

  return (
    `⚡️ *${event.type.toUpperCase()}*  \n` +
    `Txn: [\`${shortenAddress(event.transaction)}\`](${txLink})  \n` +
    `From: [\`${shortenAddress(event.from)}\`](${fromLink})  \n` +
    `To: [\`${shortenAddress(event.to)}\`](${toLink})  \n` +
    `Value: \`${humanValue}\`  \n` +
    `When: ${date}`
  );
}
