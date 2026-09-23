import type { Context as GrammyContext } from 'grammy';
import type { UniversalContext } from '@verse-bot/core';

export interface BotContext extends GrammyContext {
  db?: UniversalContext['db'];
  uctx?: UniversalContext;
}
