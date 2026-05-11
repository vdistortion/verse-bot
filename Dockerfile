FROM node:20-alpine
WORKDIR /app
COPY packages/miniapp/package.json ./packages/miniapp/
COPY packages/shared/package.json ./packages/shared/
COPY packages/tg-bot-core/package.json ./packages/tg-bot-core/
COPY packages/vk-bot-core/package.json ./packages/vk-bot-core/
COPY apps/bot/package.json ./apps/bot/
COPY package*.json ./
RUN npm ci --workspaces --include-workspace-root --ignore-scripts
COPY . .
RUN npm run build
CMD ["node", "apps/bot/dist/index.js"]
