import {
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { TelegramApi, type TelegramApiOptions } from '@verse-bot/miniapp';

export const TELEGRAM_API_CONFIG = new InjectionToken<TelegramApiOptions>('TELEGRAM_API_CONFIG');

@Injectable()
export class TelegramApiService extends TelegramApi {
  private config = inject(TELEGRAM_API_CONFIG, { optional: true });
  private platformId = inject(PLATFORM_ID);
  readonly isApp = signal(false);

  private get isBrowser(): boolean {
    return this.platformId === 'browser';
  }

  override async init(options?: TelegramApiOptions): Promise<boolean> {
    if (!this.isBrowser) return false;
    const mergedOptions = { ...this.config, ...options };
    const result = await super.init(mergedOptions);
    this.isApp.set(this.isMiniApp);
    return result;
  }

  override destroy(): void {
    if (!this.isBrowser) return;
    super.destroy();
    this.isApp.set(false);
  }
}

export function provideTelegramApi(config?: TelegramApiOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TELEGRAM_API_CONFIG,
      useValue: config ?? {},
    },
    TelegramApiService,
  ]);
}
