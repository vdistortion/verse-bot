import { catchErrors } from '@verse-bot/shared';
import { getAdvice } from '../data-sources';
import { phrases } from '../locales/ru';

export const adviceCommand = catchErrors(async (ctx) => {
    const adviceText = await getAdvice();
    await ctx.replySafe(ctx.format`${adviceText}`);
}, phrases);
