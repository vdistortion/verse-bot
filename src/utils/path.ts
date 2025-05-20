import { InputFile } from 'grammy';
import { NODE_ENV, VERCEL_PROJECT_PRODUCTION_URL } from './env';

export const getPathToAssets = (file: string) => {
  return NODE_ENV === 'production'
    ? `https://${VERCEL_PROJECT_PRODUCTION_URL}/assets/${file}`
    : new InputFile(`./public/assets/${file}`);
};
