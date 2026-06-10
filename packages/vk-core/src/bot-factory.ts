import { VK, type MessageContext, type MessageEventContext } from 'vk-io';
import { VK_MAX_RANDOM_ID } from './vk-constants.js';
import type { VKContext } from './types/index.js';

type UpdateHandler = (ctx: VKContext) => void | Promise<void>;

export interface VKBotFactoryOptions {
  token: string;
  groupId: number;
  useLogger?: boolean;
}

export class VKBot {
  private readonly vk: VK;
  private readonly groupId: number;
  private isRunning = false;

  /** vk-io API — прямые вызовы методов VK API (vk.api.users.get и т.д.) */
  public get api() {
    return this.vk.api;
  }
  /** vk-io Upload — загрузка медиафайлов (vk.upload.messagePhoto и т.д.) */
  public get upload() {
    return this.vk.upload;
  }
  /** vk-io Updates — прямая подписка на события и управление Long Poll */
  public get updates() {
    return this.vk.updates;
  }

  constructor(options: VKBotFactoryOptions) {
    this.vk = new VK({
      token: options.token,
      pollingGroupId: options.groupId,
    });
    this.groupId = options.groupId;
  }

  /**
   * Вызов произвольного метода VK API.
   * Метод передаётся строкой формата «section.method», например «users.get».
   */
  public async request(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    return this.vk.api.call(method, params);
  }

  /**
   * Подписка на события VK.
   * Поддерживаемые типы: «message_new», «message_event».
   * Контекст vk-io адаптируется к VKContext для обратной совместимости.
   */
  on(event: 'message_new' | 'message_event' | string, handler: UpdateHandler): this {
    if (event === 'message_new') {
      this.vk.updates.on('message_new', async (ctx: MessageContext, next) => {
        try {
          await handler(this.adaptMessageContext(ctx));
        } catch (err) {
          console.error('[VK Bot] message_new handler error:', err);
        }
        await next();
      });
    } else if (event === 'message_event') {
      this.vk.updates.on('message_event', async (ctx: MessageEventContext, next) => {
        try {
          await handler(this.adaptEventContext(ctx));
        } catch (err) {
          console.error('[VK Bot] message_event handler error:', err);
        }
        await next();
      });
    }
    return this;
  }

  /**
   * Конвертирует MessageContext из vk-io в VKContext.
   */
  private adaptMessageContext(ctx: MessageContext): VKContext {
    return {
      update: ctx as any, // MessageContext хранится за полем update: VKUpdate
      message: (ctx as any).message, // message — protected в vk-io; сначала ctx → any
      peerId: ctx.peerId,
      userId: ctx.senderId,
      text: ctx.text ?? '',
      payload: ctx.hasMessagePayload ? JSON.stringify(ctx.messagePayload) : undefined,
      sendMessage: this.sendMessage.bind(this),
    };
  }

  /**
   * Конвертирует MessageEventContext из vk-io в VKContext.
   */
  private adaptEventContext(ctx: MessageEventContext): VKContext {
    return {
      update: ctx as any, // аналогично
      message: undefined,
      peerId: ctx.peerId,
      userId: ctx.userId,
      text: '',
      payload: ctx.eventPayload != null ? JSON.stringify(ctx.eventPayload) : undefined,
      eventId: ctx.eventId,
      sendMessage: this.sendMessage.bind(this),
    };
  }

  /**
   * Запускает Long Poll через vk-io.
   * vk-io автоматически управляет переподключением и ротацией TS.
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[VK Bot] Starting... Group ID: ${this.groupId}`);
    await this.vk.updates.start();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.vk.updates.stop();
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
      random_id: Math.floor(Math.random() * VK_MAX_RANDOM_ID),
    };

    if (keyboard) params.keyboard = keyboard;
    if (attachment) params.attachment = attachment;

    return this.vk.api.call<number>('messages.send', params);
  }
}

export function createVKBot(options: VKBotFactoryOptions): VKBot {
  return new VKBot(options);
}
