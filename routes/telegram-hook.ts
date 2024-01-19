import bot from '../src';

const hash: string = process.env.SECRET_HASH!;

export default eventHandler(async (evt) => {
  const query = getQuery(evt);

  if (query.setWebhook === 'true') {
    const host = getRequestHeader(evt, 'x-forwarded-host') || getRequestHost(evt);
    const webhookUrl = `https://${host}/telegram-hook?secret_hash=${hash}`;
    const isSet = await bot.telegram.setWebhook(webhookUrl);
    const info = await bot.telegram.getWebhookInfo();
    return `<pre>Set webhook to ${webhookUrl}: ${isSet}<br/>${JSON.stringify(info)}</pre>`;
  } else if (query.secret_hash === hash) {
    const body = await readBody(evt);
    await bot.handleUpdate(body);
  }

  return 'Forbidden';
});
