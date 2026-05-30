import { inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { telegramApi } from '@verse-bot/miniapp';

@Injectable({ providedIn: 'root' })
export class TelegramApiService {
  private location = inject(Location);
  private router = inject(Router);

  readonly isMiniApp$ = new BehaviorSubject(false);
  readonly api = telegramApi;

  async init(): Promise<void> {
    const ok = await telegramApi.init({
      onBack: () => this.location.back(),
      onSettings: () => this.router.navigateByUrl('/settings').catch(console.error),
    });
    this.isMiniApp$.next(ok);
  }

  destroy(): void {
    telegramApi.destroy();
    this.isMiniApp$.next(false);
  }
}
