FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/md-format/package.json ./packages/md-format/
COPY packages/shared/package.json ./packages/shared/
COPY packages/tg-core/package.json ./packages/tg-core/
COPY packages/vk-core/package.json ./packages/vk-core/
COPY apps/imp-bot/package.json ./apps/imp-bot/
RUN npm ci --ignore-scripts
COPY tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/imp-bot/ ./apps/imp-bot/
RUN npm run build:release

FROM node:20-alpine
RUN apk add --no-cache postgresql-client
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/md-format/package.json ./packages/md-format/
COPY --from=builder /app/packages/md-format/dist ./packages/md-format/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/tg-core/package.json ./packages/tg-core/
COPY --from=builder /app/packages/tg-core/dist ./packages/tg-core/dist
COPY --from=builder /app/packages/vk-core/package.json ./packages/vk-core/
COPY --from=builder /app/packages/vk-core/dist ./packages/vk-core/dist
COPY --from=builder /app/apps/imp-bot/package.json ./apps/imp-bot/
COPY --from=builder /app/apps/imp-bot/dist ./apps/imp-bot/dist
CMD ["node", "apps/imp-bot/dist/index.js"]
