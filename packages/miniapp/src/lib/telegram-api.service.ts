import {
  bindThemeParamsCssVars,
  closeMiniApp,
  disableVerticalSwipes,
  hideBackButton,
  hideSettingsButton,
  init,
  miniApp,
  miniAppReady,
  mountBackButton,
  mountClosingBehavior,
  mountMainButton,
  mountSecondaryButton,
  mountSettingsButton,
  mountSwipeBehavior,
  mountViewport,
  onBackButtonClick,
  onMainButtonClick,
  onSecondaryButtonClick,
  onSettingsButtonClick,
  setMainButtonParams,
  setSecondaryButtonParams,
  showBackButton,
  showSettingsButton,
  unmountBackButton,
  unmountClosingBehavior,
  unmountMainButton,
  unmountSecondaryButton,
  unmountSettingsButton,
  unmountSwipeBehavior,
  unmountViewport,
} from '@telegram-apps/sdk';

export interface TelegramApiOptions {
  onBack?: () => void;
  onSettings?: () => void;
}

export class TelegramApi {
  #isMiniApp = false;
  #listeners: VoidFunction[] = [];

  get isMiniApp(): boolean {
    return this.#isMiniApp;
  }

  async init(options: TelegramApiOptions = {}): Promise<boolean> {
    try {
      init();
      mountViewport.ifAvailable();
      mountSwipeBehavior.ifAvailable();
      mountClosingBehavior.ifAvailable();
      mountMainButton.ifAvailable();
      mountSecondaryButton.ifAvailable();
      mountSettingsButton.ifAvailable();
      mountBackButton.ifAvailable();
      miniApp.mountSync.ifAvailable();
      this.#isMiniApp = true;
    } catch {
      return false;
    }

    disableVerticalSwipes.ifAvailable();
    miniAppReady.ifAvailable();
    bindThemeParamsCssVars();

    this.#listeners.push(
      onSecondaryButtonClick(closeMiniApp),
      onBackButtonClick(() => options.onBack?.() ?? window.history.back()),
    );

    if (options.onSettings) {
      this.#listeners.push(onSettingsButtonClick(options.onSettings));
    }

    return true;
  }

  showMainButton(text: string): void {
    if (!this.#isMiniApp) return;
    setMainButtonParams({ text, isEnabled: true, isVisible: true });
  }

  hideMainButton(): void {
    if (!this.#isMiniApp) return;
    setMainButtonParams({ isEnabled: false, isVisible: false });
  }

  showSecondaryButton(text: string): void {
    if (!this.#isMiniApp) return;
    setSecondaryButtonParams({ text, isEnabled: true, isVisible: true });
  }

  hideSecondaryButton(): void {
    if (!this.#isMiniApp) return;
    setSecondaryButtonParams({ isEnabled: false, isVisible: false });
  }

  showBackButton(): void {
    if (!this.#isMiniApp) return;
    showBackButton();
  }

  hideBackButton(): void {
    if (!this.#isMiniApp) return;
    hideBackButton();
  }

  showSettingsButton(): void {
    if (!this.#isMiniApp) return;
    showSettingsButton();
  }

  hideSettingsButton(): void {
    if (!this.#isMiniApp) return;
    hideSettingsButton();
  }

  onMainButtonClick(cb: () => void): VoidFunction {
    if (!this.#isMiniApp) return () => {};
    return onMainButtonClick(cb);
  }

  destroy(): void {
    if (!this.#isMiniApp) return;
    this.#listeners.forEach((l) => l());
    this.#listeners = [];
    unmountViewport();
    unmountSwipeBehavior();
    unmountClosingBehavior();
    unmountMainButton();
    unmountSecondaryButton();
    unmountSettingsButton();
    unmountBackButton();
    this.#isMiniApp = false;
  }
}

export const telegramApi = new TelegramApi();
