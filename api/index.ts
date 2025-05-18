import { webhookCallback } from 'grammy';
import { bot } from '../src';
import { production } from '../src/core';

export default async function handler(req: any, res: any) {
  await production();
  webhookCallback(bot, 'https')(req, res);
};
