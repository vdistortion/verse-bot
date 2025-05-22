import type { Bot, Context } from 'grammy';
import { commands } from '../core';
import { flag_connect } from '../commands';
import { FLAG_CONNECT } from '../utils/env';
import { http } from '../utils/http';
import { pickRandom } from '../utils/pickRandom';
import { chunk } from '../utils/chunkArray';
import { reply, replyWithPhoto } from '../utils/reply';

interface ICountry {
  name: {
    en: string;
    ru: string;
  };
  flag: string[];
}

const url = FLAG_CONNECT!;
let countries: ICountry[] = [];
let count = 4;

async function getApiCountries() {
  if (!countries.length) countries = await http<ICountry[]>(`${url}/countries.json`);
  return countries;
}

export async function handlerFlagConnect(ctx: Context) {
  const apiCountries = await getApiCountries();
  const list: [number, ICountry][] = [];
  const indexes: number[] = [];

  while (indexes.length < count) {
    const index = pickRandom(apiCountries);
    if (!indexes.includes(index)) indexes.push(index);
  }

  indexes.forEach((index) => {
    list.push([index, apiCountries[index]]);
  });

  const randomIndex = pickRandom(list);
  const [indexCountry, country] = list[randomIndex];
  const flag = url + '/images/flags/' + country.flag[0];
  const buttons = list.map(([index, { name }]) => ({
    text: count > 1 ? name.ru : 'Показать ответ',
    callback_data: `flag_answer|${index}|${indexCountry}`,
  }));

  await replyWithPhoto(ctx, flag, 'Какая это страна?', chunk(buttons, 2));
}

async function callbackQueryCountries(countryIndex: number, correctCountryIndex: number) {
  const countries = await getApiCountries();
  const countryName: string = countries[countryIndex].name.ru;
  const correctCountryName: string = countries[correctCountryIndex].name.ru;

  const answer =
    countryIndex === correctCountryIndex
      ? count > 1
        ? `☑️ Правильно, это ${correctCountryName}`
        : `Это ${correctCountryName}`
      : `Вы ответили ${countryName}.\n❌ Неправильно, это ${correctCountryName}`;
  return { answer };
}

export function runFlagsService(bot: Bot) {
  bot.command(commands.flags.command, flag_connect());

  bot.hears(commands.flags.text, handlerFlagConnect);

  bot.callbackQuery(/^flag_answer\|/, async (ctx) => {
    const [_, countryIndex, correctCountryIndex] = ctx.callbackQuery.data.split('|');
    const { answer } = await callbackQueryCountries(
      Number(countryIndex),
      Number(correctCountryIndex),
    );

    await ctx.editMessageCaption({
      caption: answer,
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⚙️', callback_data: 'flag_settings' },
            { text: 'Продолжить', callback_data: 'flag_more' },
          ],
        ],
      },
    });

    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('flag_more', async (ctx) => {
    await handlerFlagConnect(ctx);
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('flag_settings', async (ctx) => {
    await reply(ctx, 'Сколько должно быть вариантов ответа?', {
      inlineKeyboard: [
        [
          { text: '2', callback_data: 'flag_setting|2' },
          { text: '3', callback_data: 'flag_setting|3' },
          { text: '4', callback_data: 'flag_setting|4' },
          { text: '5', callback_data: 'flag_setting|5' },
          { text: '6', callback_data: 'flag_setting|6' },
          { text: '7', callback_data: 'flag_setting|7' },
          { text: '8', callback_data: 'flag_setting|8' },
          { text: '9', callback_data: 'flag_setting|9' },
        ],
        [
          { text: '10', callback_data: 'flag_setting|10' },
          { text: 'Без вариантов', callback_data: 'flag_setting|1' },
        ],
      ],
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^flag_setting\|/, async (ctx) => {
    const [_, newCount] = ctx.callbackQuery.data.split('|');
    count = Number(newCount);
    await ctx.answerCallbackQuery();
  });
}
