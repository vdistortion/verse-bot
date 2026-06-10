import type { Context as GrammyContext } from 'grammy';
import type { Pool } from 'pg';
import type { UniversalContext } from '@verse-bot/core';

// Расширяем контекст grammy
export interface BotContext extends GrammyContext {
  // Можно добавить свои поля
  db?: Pool;
  uctx?: UniversalContext;
}
