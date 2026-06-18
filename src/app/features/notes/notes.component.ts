import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { DiaryService } from '../../core/services/diary.service';

@Component({
  selector: 'app-notes',
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent {
  private readonly diary = inject(DiaryService);

  readonly notes = this.diary.notesSignal;
  readonly groupedNotes = this.diary.groupedNotesSignal;
  readonly loading = this.diary.loading;
  readonly error = this.diary.error;

  // Get sorted date keys (in reverse order - newest first)
  readonly sortedDates = computed(() => {
    return Object.keys(this.groupedNotes()).sort().reverse();
  });

  retry(): void {
    void this.diary.refreshNotes();
  }
}
