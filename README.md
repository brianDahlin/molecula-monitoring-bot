# Molecula Monitoring Bot

A simple Telegram bot that monitors token operations (transfer, deposit, withdrawal, swaps) on Ethereum (via Molecula's GraphQL API) and sends real-time alerts to a Telegram channel.

## Features

- Subscribes to all `tokenOperations` events via WebSocket (GraphQL-WS).
- Sends formatted Telegram messages for each operation:

  - **Txn** link on Etherscan
  - **From** and **To** addresses (shortened, linked)
  - **Value** (human-readable, rounded to 4 decimals)
  - **Timestamp** in local locale

- Dockerized for easy deployment
- Configurable via environment variables

## Tech Stack

- **NestJS** – application framework
- **graphql-ws** + **ws** – GraphQL WebSocket subscriptions
- **ethers** – utility for formatting token values
- **telegraf** (Telegram API client) – sending messages
- **Docker & Docker Compose** – containerization

## Prerequisites

- Docker Engine & Docker Compose
- A Telegram bot token (from @BotFather)
- A Telegram channel or chat ID where the bot will post

## Getting Started

### Clone the repository

```bash
git clone https://github.com/your-org/molecula-monitoring-bot.git
cd molecula-monitoring-bot
```

### Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```ini
GRAPHQL_WS_URL=wss://nitrogen-token-tracker.molecula.tech/graphql
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUvWXyz
TELEGRAM_CHAT_ID=-1001234567890
# CONTRACT_ADDRESS is optional; leave empty to subscribe to all tokens
CONTRACT_ADDRESS=
```

- `GRAPHQL_WS_URL` – WebSocket URL for Molecula GraphQL
- `TELEGRAM_BOT_TOKEN` – your bot’s API token
- `TELEGRAM_CHAT_ID` – channel or chat ID (e.g. `-100...` for a channel)
- `CONTRACT_ADDRESS` – single token address to filter (optional)

### Running with Docker

Build and start the service:

```bash
docker compose up -d --build
```

View realtime logs:

```bash
docker compose logs -f bot-monitor
```

### Running Locally (without Docker)

1. Install dependencies:

   ```bash
   npm install
   ```

# or

```bash
 yarn install
```

````

2. Build and run:
   ```bash
yarn build
node dist/main.js
# or
npm run build
npm run start
````

Ensure your `.env` is present before running.

## Customization

- **Filter by token**: set `CONTRACT_ADDRESS=0xYourTokenAddress` to receive only that token’s events.
- **Message format**: edit `src/constants.ts` to customize Markdown layout.
- **Logging**: change log levels or use a different logger in `SubscriptionService`.

## Troubleshooting

- **409 Conflict**: removed polling by using `new Telegram(token)` instead of `Telegraf`.
- **No events**: verify subscription in GraphQL Playground or via `wscat`.
- **Docker build errors**: ensure your `Dockerfile` uses a valid Node base image (e.g. `node:18-alpine` or `node:20-bullseye-slim`).

## License

MIT License © Molecula LTD

Built by Artemiy Yurin (Yurin_sol)
