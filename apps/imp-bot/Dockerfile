FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/postgres/package.json ./packages/postgres/
COPY packages/telegram/package.json ./packages/telegram/
COPY packages/vk/package.json ./packages/vk/
COPY apps/imp-bot/package.json ./apps/imp-bot/
RUN npm ci --ignore-scripts
COPY tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/imp-bot/ ./apps/imp-bot/
RUN npm run build:release

FROM node:22-alpine
RUN apk add --no-cache postgresql-client
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/postgres/package.json ./packages/postgres/
COPY --from=builder /app/packages/postgres/dist ./packages/postgres/dist
COPY --from=builder /app/packages/telegram/package.json ./packages/telegram/
COPY --from=builder /app/packages/telegram/dist ./packages/telegram/dist
COPY --from=builder /app/packages/vk/package.json ./packages/vk/
COPY --from=builder /app/packages/vk/dist ./packages/vk/dist
COPY --from=builder /app/apps/imp-bot/package.json ./apps/imp-bot/
COPY --from=builder /app/apps/imp-bot/dist ./apps/imp-bot/dist
CMD ["node", "apps/imp-bot/dist/index.js"]
