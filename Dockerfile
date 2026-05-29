FROM node:20-alpine
WORKDIR /app
COPY packages/miniapp/package.json ./packages/miniapp/
COPY packages/shared/package.json ./packages/shared/
COPY packages/tg-core/package.json ./packages/tg-core/
COPY packages/vk-core/package.json ./packages/vk-core/
COPY apps/imp-bot/package.json ./apps/imp-bot/
COPY package*.json ./
RUN npm ci --workspaces --include-workspace-root --ignore-scripts
COPY . .
RUN npm run build
CMD ["node", "apps/imp-bot/dist/index.js"]
