FROM node:20-alpine

RUN apk update \
 && apk upgrade \
 && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --no-audit

COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]