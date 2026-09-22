import type { Context as GrammyContext } from 'grammy';
import type { UniversalContext } from '@verse-bot/core';

// Расширяем контекст grammy
export interface BotContext extends GrammyContext {
  // Можно добавить свои поля
  db?: UniversalContext['db'];
  uctx?: UniversalContext;
}
