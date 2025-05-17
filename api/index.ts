import { webhookCallback } from 'grammy';
import { bot } from '../src';

export default webhookCallback(bot, 'std/http');
