import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationPreferencesService } from '../../core/services/notification-preferences.service';
import { NotificationPreferences } from '../../shared/models/diary.models';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly prefsService = inject(NotificationPreferencesService);

  readonly prefs = this.prefsService.preferences;

  update(field: keyof NotificationPreferences, value: string | boolean | number): void {
    this.prefsService.update({ [field]: value });
  }
}
