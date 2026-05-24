# @scope/miniapp

Telegram Mini App utilities. Framework-agnostic core with an optional Angular integration.

## Core

\`\`\`ts
import { telegramApi } from '@scope/miniapp';

await telegramApi.init({
onBack: () => window.history.back(),
});

telegramApi.showMainButton('Submit');
\`\`\`

## Angular

\`\`\`ts
import { TelegramApiService } from '@scope/miniapp/angular';

@Component({ ... })
export class AppComponent {
private tg = inject(TelegramApiService);

ngOnInit() {
this.tg.init();
}
}
\`\`\`
