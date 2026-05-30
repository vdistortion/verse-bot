# @verse-bot/miniapp

Telegram Mini App integration utilities. Framework-agnostic core with an optional Angular integration layer built with Angular Package Format (APF).

## Installation

```bash
npm install @verse-bot/miniapp
```

Angular peer dependencies are optional — install them only if you use the `/angular` entry:

```bash
npm install @angular/core @angular/common @angular/router rxjs
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
telegramApi.showMainButton('Submit');
telegramApi.hideMainButton();

const off = telegramApi.onMainButtonClick(() => {
  handleSubmit();
});

// Secondary button (closes the Mini App by default)
telegramApi.showSecondaryButton('Cancel');
telegramApi.hideSecondaryButton();

// Back button
telegramApi.showBackButton();
telegramApi.hideBackButton();

// Settings button
telegramApi.showSettingsButton();
telegramApi.hideSettingsButton();

// Check if running inside Telegram
if (telegramApi.isMiniApp) {
  // Telegram-specific logic
}

// Cleanup
telegramApi.destroy();
```

### Angular

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
    // tg.isMiniApp$ — BehaviorSubject<boolean>
    // tg.api — direct access to the TelegramApi instance
  }

  ngOnDestroy() {
    this.tg.destroy();
  }
}
```

The Angular service automatically wires `onBack` to `Location.back()` and `onSettings` to `router.navigateByUrl('/settings')`.

Access the underlying API via `tg.api`:

```ts
this.tg.api.showMainButton('Confirm');

const off = this.tg.api.onMainButtonClick(() => this.submit());
// call off() to unsubscribe
```

## API

### `TelegramApi`

| Method                      | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `init(options?)`            | Initialize the Mini App. Returns `Promise<boolean>` — `true` if running inside Telegram. |
| `destroy()`                 | Remove all listeners and unmount components.                                             |
| `showMainButton(text)`      | Show the main bottom button with the given label.                                        |
| `hideMainButton()`          | Hide the main button.                                                                    |
| `onMainButtonClick(cb)`     | Subscribe to main button clicks. Returns an unsubscribe function.                        |
| `showSecondaryButton(text)` | Show the secondary button (closes the app by default).                                   |
| `hideSecondaryButton()`     | Hide the secondary button.                                                               |
| `showBackButton()`          | Show the native back button.                                                             |
| `hideBackButton()`          | Hide the native back button.                                                             |
| `showSettingsButton()`      | Show the settings gear button.                                                           |
| `hideSettingsButton()`      | Hide the settings button.                                                                |
| `isMiniApp`                 | `boolean` — whether the app is running inside Telegram.                                  |

### `TelegramApiOptions`

```ts
interface TelegramApiOptions {
  onBack?: () => void; // called when the back button is tapped
  onSettings?: () => void; // called when the settings button is tapped
}
```

### `TelegramApiService` (Angular)

| Member       | Description                                                      |
| ------------ | ---------------------------------------------------------------- |
| `init()`     | Initialize — wires back/settings to Angular Router and Location. |
| `destroy()`  | Cleanup.                                                         |
| `isMiniApp$` | `BehaviorSubject<boolean>`                                       |
| `api`        | The underlying `TelegramApi` instance.                           |

## Compatibility

| Dependency           | Version               |
| -------------------- | --------------------- |
| `@telegram-apps/sdk` | `^3.x`                |
| `@angular/core`      | `>=14 <22` (optional) |
| `rxjs`               | `>=7 <8` (optional)   |
| Node.js              | `>=18`                |

## License

Apache-2.0
