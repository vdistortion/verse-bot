# @verse-bot/miniapp

Telegram Mini App integration utilities. Framework-agnostic core with an optional Angular integration layer built with Angular Package Format (APF).

## Installation

```bash
npm install @verse-bot/miniapp
```

Angular peer dependencies are optional — install them only if you use the `/angular` entry:

```bash
npm install @angular/core
```

## Usage

### Framework-agnostic (plain TypeScript)

```ts
import { telegramApi } from '@verse-bot/miniapp';

// Initialize — returns true if running inside Telegram Mini App
const isMiniApp = await telegramApi.init({
  onBack: () => window.history.back(),
  onSettings: () => router.push('/settings'),
});

// Main button
telegramApi.mainButton.show('Submit');
telegramApi.mainButton.hide();

const off = telegramApi.mainButton.onClick(() => {
  handleSubmit();
});

// Secondary button (closing the Mini App requires explicit binding)
telegramApi.secondaryButton.show('Cancel');
telegramApi.secondaryButton.onClick(() => telegramApi.miniApp.close());

// Back button
telegramApi.backButton.show();
telegramApi.backButton.hide();

// Settings button
telegramApi.settingsButton.show();
telegramApi.settingsButton.hide();

// Check if running inside Telegram
if (telegramApi.isMiniApp) {
  // Telegram-specific logic
}

// Cleanup
telegramApi.destroy();
```

### Angular

First, add the provider to your application config:

```ts
import { provideTelegramApi } from '@verse-bot/miniapp/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTelegramApi({
      onBack: () => window.history.back(),
      onSettings: () => {
        /* router.navigate */
      },
    }),
  ],
};
```

Then use the service in your component:

```ts
import { TelegramApiService } from '@verse-bot/miniapp/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class AppComponent implements OnInit, OnDestroy {
  readonly tg = inject(TelegramApiService);

  async ngOnInit() {
    await this.tg.init();
    // tg.isApp() — reactive signal (boolean)
    // tg.isMiniApp — non-reactive getter
  }

  showMain() {
    this.tg.mainButton.show('Confirm');
    this.tg.mainButton.onClick(() => this.submit());
  }

  showCancel() {
    this.tg.secondaryButton.show('Cancel');
    this.tg.secondaryButton.onClick(() => this.tg.miniApp.close());
  }

  ngOnDestroy() {
    this.tg.destroy();
  }
}
```

You can also override options per `init()` call:

```ts
await this.tg.init({
  onSettings: () => {
    /* different handler */
  },
});
```

## API

### `TelegramApi`

Base class, framework-agnostic.

| Member            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `init(options?)`  | Initialize the Mini App. Returns `Promise<boolean>`.       |
| `destroy()`       | Remove all listeners and cleanup SDK.                      |
| `isMiniApp`       | `boolean` getter — whether Telegram environment is active. |
| `mainButton`      | `MainButtonController`                                     |
| `secondaryButton` | `SecondaryButtonController`                                |
| `backButton`      | `BackButtonController`                                     |
| `settingsButton`  | `SettingsButtonController`                                 |
| `miniApp`         | `MiniAppController`                                        |

#### Controllers

**MainButtonController**, **SecondaryButtonController**

- `show(text: string)`: set label and show.
- `hide()`: hide the button.
- `onClick(cb: () => void)`: subscribe to click, returns unsubscribe function.

**BackButtonController**, **SettingsButtonController**

- `show()`: show the button.
- `hide()`: hide the button.
- `onClick(cb: () => void)`: subscribe to click, returns unsubscribe function.

**MiniAppController**

- `close()`: programmatically close the Mini App.

### `TelegramApiOptions`

```ts
interface TelegramApiOptions {
  onBack?: () => void; // called when the back button is tapped
  onSettings?: () => void; // called when the settings button is tapped
}
```

### `TelegramApiService` (Angular)

Extends `TelegramApi`, adds Angular-specific features.

| Member           | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| `init(options?)` | Merges options from `TELEGRAM_API_CONFIG` and calls super.       |
| `destroy()`      | Cleans up and sets signal to false.                              |
| `isApp`          | `Signal<boolean>` — reactive indicator of Mini App availability. |

### `provideTelegramApi(config?)`

Returns `EnvironmentProviders` to be used in `providers` array. Accepts optional `TelegramApiOptions`.

## Compatibility

| Dependency      | Version           |
| --------------- | ----------------- |
| `@tma.js/sdk`   | `^3.x`            |
| `@angular/core` | `>=16` (optional) |
| Node.js         | `>=18`            |

## License

Apache-2.0
