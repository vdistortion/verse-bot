import type { VKContext, VKUpdate } from './types/index.js';

type UpdateHandler = (ctx: VKContext) => void | Promise<void>;

export interface VKBotFactoryOptions {
  token: string;
  groupId: number;
  useLogger?: boolean;
}

interface LongPollResponse {
  ts: number;
  updates?: VKUpdate[];
  failed?: number;
}

export class VKBot {
  private token: string;
  private groupId: number;
  private ts: number = 0;
  private handlers: Map<string, UpdateHandler[]> = new Map();
  private isRunning = false;

  constructor(options: VKBotFactoryOptions) {
    this.token = options.token;
    this.groupId = options.groupId;
  }

  public async request(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const url = new URL(`https://api.vk.com/method/${method}`);
    url.searchParams.set('access_token', this.token);
    url.searchParams.set('v', '5.131');

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const fetchOptions: RequestInit = {};
    const response = await fetch(url.toString(), fetchOptions);
    const data = (await response.json()) as { error?: unknown; response?: unknown };

    if ('error' in data) {
      throw new Error(JSON.stringify(data.error));
    }

    return data.response;
  }

  private async getLongPollServer(): Promise<{ server: string; key: string; ts: number }> {
    const response = (await this.request('groups.getLongPollServer', {
      group_id: this.groupId,
    })) as { server: string; key: string; ts: number };

    return response;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log(`[VK Bot] Starting... Group ID: ${this.groupId}`);

    let server: string;
    let key: string;
    let ts: number;

    try {
      ({ server, key, ts } = await this.getLongPollServer());
      this.ts = ts;
      console.log(`[VK Bot] Initial LongPoll server obtained. TS: ${this.ts}`);
    } catch (initErr) {
      console.error('[VK Bot] Failed to get initial LongPoll server:', initErr);
      this.isRunning = false;
      return;
    }

    while (this.isRunning) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const url = `${server}?act=a_check&key=${key}&ts=${this.ts}&wait=25&mode=2&version=10`;

        const fetchOptions: RequestInit = { signal: controller.signal };
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as LongPollResponse;

        if (data.failed) {
          console.warn(
            `[VK Bot] LongPoll returned 'failed': ${data.failed}. Re-fetching server...`,
          );
          ({ server, key, ts } = await this.getLongPollServer());
          this.ts = ts;
          continue; // Начинаем новый цикл с новым сервером
        }

        if (data.ts) {
          this.ts = data.ts;
        }

        for (const update of data.updates ?? []) {
          try {
            await this.handleUpdate(update);
          } catch (err) {
            console.error('[VK Bot] Error processing update:', err);
          }
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.warn('[VK Bot] Long poll request timed out (30s). Reconnecting...');
        } else {
          console.error('[VK Bot] Long poll error:', err);
        }

        await new Promise((r) => setTimeout(r, 3000));

        try {
          ({ server, key, ts } = await this.getLongPollServer());
          this.ts = ts;
          console.log(`[VK Bot] Reconnected to LongPoll server. New TS: ${this.ts}`);
        } catch (reconnectErr) {
          console.error('[VK Bot] Reconnect failed:', reconnectErr);
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }
  }

  stop(): void {
    this.isRunning = false;
  }

  async processUpdate(update: VKUpdate): Promise<void> {
    await this.handleUpdate(update);
  }

  private async handleUpdate(update: VKUpdate): Promise<void> {
    const ctx: VKContext = {
      update,
      message: update.object.message,
      peerId: update.object.peer_id ?? update.object.message?.peer_id ?? 0,
      userId: update.object.user_id ?? update.object.message?.from_id ?? 0,
      text: update.object.message?.text ?? '',
      payload: update.object.message?.payload ?? update.object.payload,
      eventId: update.object.event_id,
      sendMessage: this.sendMessage.bind(this),
    };

    // Обработчики
    const handlers = this.handlers.get(update.type) ?? [];
    for (const handler of handlers) {
      try {
        await handler(ctx);
      } catch (err) {
        console.error('[VK Bot] Handler error:', err);
      }
    }
  }

  on(event: string, handler: UpdateHandler): this {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
    return this;
  }

  async sendMessage(
    peerId: number,
    text: string,
    keyboard?: string,
    attachment?: string,
  ): Promise<number> {
    const params: Record<string, unknown> = {
      peer_id: peerId,
      message: text,
      random_id: Date.now(),
    };

    if (keyboard) {
      params.keyboard = keyboard;
    }

    if (attachment) {
      params.attachment = attachment;
    }

    const response = await this.request('messages.send', params);
    return response as number;
  }
}

export function createVKBot(options: VKBotFactoryOptions): VKBot {
  return new VKBot(options);
}
