import {
  init,
  miniApp,
  viewport,
  backButton,
  mainButton,
  settingsButton,
  secondaryButton,
  closingBehavior,
  swipeBehavior,
  themeParams,
} from '@tma.js/sdk';

export interface TelegramApiOptions {
  onBack?: () => void;
  onSettings?: () => void;
}

// --------------- Controllers ---------------

class MainButtonController {
  constructor(private parent: TelegramApi) {}

  show(text: string): void {
    if (!this.parent.isMiniApp) return;
    mainButton.setText(text);
    mainButton.show.ifAvailable();
  }

  hide(): void {
    if (!this.parent.isMiniApp) return;
    mainButton.hide.ifAvailable();
  }

  onClick(cb: () => void): VoidFunction {
    if (!this.parent.isMiniApp) return () => {};
    return mainButton.onClick(cb);
  }
}

class SecondaryButtonController {
  constructor(private parent: TelegramApi) {}

  show(text: string): void {
    if (!this.parent.isMiniApp) return;
    secondaryButton.setText(text);
    secondaryButton.show.ifAvailable();
  }

  hide(): void {
    if (!this.parent.isMiniApp) return;
    secondaryButton.hide.ifAvailable();
  }

  onClick(cb: () => void): VoidFunction {
    if (!this.parent.isMiniApp) return () => {};
    return secondaryButton.onClick(cb);
  }
}

class BackButtonController {
  constructor(private parent: TelegramApi) {}

  show(): void {
    if (!this.parent.isMiniApp) return;
    backButton.show.ifAvailable();
  }

  hide(): void {
    if (!this.parent.isMiniApp) return;
    backButton.hide.ifAvailable();
  }

  onClick(cb: () => void): VoidFunction {
    if (!this.parent.isMiniApp) return () => {};
    return backButton.onClick(cb);
  }
}

class SettingsButtonController {
  constructor(private parent: TelegramApi) {}

  show(): void {
    if (!this.parent.isMiniApp) return;
    settingsButton.show.ifAvailable();
  }

  hide(): void {
    if (!this.parent.isMiniApp) return;
    settingsButton.hide.ifAvailable();
  }

  onClick(cb: () => void): VoidFunction {
    if (!this.parent.isMiniApp) return () => {};
    return settingsButton.onClick(cb);
  }
}

class MiniAppController {
  constructor(private parent: TelegramApi) {}

  close(): void {
    if (!this.parent.isMiniApp) return;
    miniApp.close.ifAvailable();
  }
}

// --------------- Main Class ---------------

export class TelegramApi {
  #listeners: VoidFunction[] = [];
  #cleanupSdk: (() => void) | null = null;

  // Cached controllers
  #mainButtonCtrl?: MainButtonController;
  #secondaryButtonCtrl?: SecondaryButtonController;
  #backButtonCtrl?: BackButtonController;
  #settingsButtonCtrl?: SettingsButtonController;
  #miniAppCtrl?: MiniAppController;

  get isMiniApp(): boolean {
    return this.#cleanupSdk !== null;
  }

  get mainButton(): MainButtonController {
    this.#mainButtonCtrl ??= new MainButtonController(this);
    return this.#mainButtonCtrl;
  }

  get secondaryButton(): SecondaryButtonController {
    this.#secondaryButtonCtrl ??= new SecondaryButtonController(this);
    return this.#secondaryButtonCtrl;
  }

  get backButton(): BackButtonController {
    this.#backButtonCtrl ??= new BackButtonController(this);
    return this.#backButtonCtrl;
  }

  get settingsButton(): SettingsButtonController {
    this.#settingsButtonCtrl ??= new SettingsButtonController(this);
    return this.#settingsButtonCtrl;
  }

  get miniApp(): MiniAppController {
    this.#miniAppCtrl ??= new MiniAppController(this);
    return this.#miniAppCtrl;
  }

  async init(options: TelegramApiOptions = {}): Promise<boolean> {
    if (this.isMiniApp) return Promise.resolve(true);
    // SSR safety – не запускаем инициализацию вне браузера
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      this.#cleanupSdk = init();

      viewport.mount.ifAvailable();
      swipeBehavior.mount.ifAvailable();
      closingBehavior.mount.ifAvailable();
      mainButton.mount.ifAvailable();
      secondaryButton.mount.ifAvailable();
      settingsButton.mount.ifAvailable();
      backButton.mount.ifAvailable();
      miniApp.mount.ifAvailable();
      themeParams.mount.ifAvailable();

      swipeBehavior.disableVertical.ifAvailable();
      miniApp.ready.ifAvailable();
      miniApp.bindCssVars.ifAvailable();
      themeParams.bindCssVars.ifAvailable();

      if (options.onBack) {
        this.#listeners.push(backButton.onClick(options.onBack));
      }
      if (options.onSettings) {
        this.#listeners.push(settingsButton.onClick(options.onSettings));
      }

      return Promise.resolve(true);
    } catch (e) {
      console.error('Failed to initialize Telegram Mini App SDK:', e);
      this.#cleanupSdk = null;
      return Promise.resolve(false);
    }
  }

  destroy(): void {
    if (!this.isMiniApp) return;

    this.#listeners.forEach((l) => l());
    this.#listeners = [];

    this.#cleanupSdk?.();
    this.#cleanupSdk = null;
  }
}

export const telegramApi = new TelegramApi();
