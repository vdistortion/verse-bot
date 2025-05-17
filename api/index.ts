import { webhookCallback } from 'grammy';
import {production} from '../src/core';
import { bot } from '../src';

export default async function handler(req: any) {
  await production(bot);
  return webhookCallback(bot, "std/http")(req);
}
