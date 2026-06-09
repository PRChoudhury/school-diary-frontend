import { Injectable, signal } from '@angular/core';
import { NotificationPreferences } from '../../shared/models/diary.models';

const STORAGE_KEY = 'school-diary-notification-prefs';

const DEFAULTS: NotificationPreferences = {
  email_enabled: true,
  sms_enabled: false,
  email: '',
  phone: '',
  default_lead_days: 1,
  default_lead_hours: 0,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

@Injectable({ providedIn: 'root' })
export class NotificationPreferencesService {
  private readonly prefs = signal<NotificationPreferences>(this.load());

  readonly preferences = this.prefs.asReadonly();

  update(partial: Partial<NotificationPreferences>): void {
    const updated = { ...this.prefs(), ...partial };
    this.prefs.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  private load(): NotificationPreferences {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as NotificationPreferences) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }
}
