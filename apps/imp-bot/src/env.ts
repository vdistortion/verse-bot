import { z } from 'zod';

const schema = z
  .object({
    TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
    TELEGRAM_BOT_USERNAME: z.string().optional(),
    TELEGRAM_ADMIN_ID: z.coerce.number().int().positive().optional(),
    VK_GROUP_TOKEN: z.string().min(1).optional(),
    VK_GROUP_ID: z.coerce.number().int().positive().optional(),
    VK_ADMIN_ID: z.coerce.number().int().positive().optional(),
    PUBLIC_URL: z.url().optional(),
    CONTENT_DIR: z.string(),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_DB: z.string().min(1),
  })
  .refine((d) => d.TELEGRAM_BOT_TOKEN || d.VK_GROUP_TOKEN, {
    message: 'At least one of TELEGRAM_BOT_TOKEN or VK_GROUP_TOKEN must be set',
  })
  .refine((d) => !d.VK_GROUP_TOKEN || d.VK_GROUP_ID !== undefined, {
    message: 'VK_GROUP_ID must be set when VK_GROUP_TOKEN is configured',
    path: ['VK_GROUP_ID'],
  });

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('[env] Invalid environment variables:');
  for (const issue of result.error.issues) {
    const path = issue.path.length ? issue.path.join('.') : 'form';
    console.error(`  ${path}: ${issue.message}`);
  }
  process.exit(1);
}

export const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_ADMIN_ID,
  VK_GROUP_TOKEN,
  VK_GROUP_ID,
  VK_ADMIN_ID,
  PUBLIC_URL,
  CONTENT_DIR,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_DB,
} = result.data;
