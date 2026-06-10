import type { Context as GrammyContext, SessionFlavor } from 'grammy';
import type { Pool } from 'pg';
import type { UniversalContext } from '@verse-bot/core';

export interface SessionData {
  // Здесь будут общие данные сессии, например:
  // userId: number;
  // language: 'ru' | 'en';
}

// Расширяем контекст gramgrammy
export interface BotContext extends GrammyContext, SessionFlavor<SessionData> {
  // Можно добавить свои поля
  db?: Pool;
  uctx?: UniversalContext;
}
