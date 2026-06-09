import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DiaryService } from '../../core/services/diary.service';

@Component({
  selector: 'app-calendar',
  imports: [RouterLink, DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  private readonly diary = inject(DiaryService);

  readonly viewDate = signal(new Date());

  readonly monthLabel = computed(() =>
    this.viewDate().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  );

  readonly events = computed(() => {
    const d = this.viewDate();
    const notes = this.diary.notesSignal();
    return this.diary
      .getEventsForMonth(notes, d.getFullYear(), d.getMonth())
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  });

  prevMonth(): void {
    this.viewDate.update((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    this.viewDate.update((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
}
