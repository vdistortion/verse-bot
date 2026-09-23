import { describe, expect, it } from 'vitest';
import { TelegramApi } from './telegram-api.js';

describe('TelegramApi outside Telegram Mini App', () => {
  it('is SSR-safe and reports that the Mini App is unavailable', async () => {
    const api = new TelegramApi();

    await expect(api.init()).resolves.toBe(false);
    expect(api.isMiniApp).toBe(false);
    expect(() => {
      api.mainButton.show('Save');
      api.mainButton.hide();
      api.secondaryButton.show('More');
      api.backButton.show();
      api.settingsButton.show();
      api.miniApp.close();
      api.destroy();
    }).not.toThrow();
  });

  it('caches controller instances', () => {
    const api = new TelegramApi();

    expect(api.mainButton).toBe(api.mainButton);
    expect(api.secondaryButton).toBe(api.secondaryButton);
    expect(api.backButton).toBe(api.backButton);
    expect(api.settingsButton).toBe(api.settingsButton);
    expect(api.miniApp).toBe(api.miniApp);
  });
});
