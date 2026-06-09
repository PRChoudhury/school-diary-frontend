import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DiaryService } from '../../core/services/diary.service';

@Component({
  selector: 'app-notes',
  imports: [RouterLink, DatePipe],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent {
  private readonly diary = inject(DiaryService);

  readonly notes = this.diary.notesSignal;
  readonly loading = this.diary.loading;
  readonly error = this.diary.error;

  retry(): void {
    void this.diary.refreshNotes();
  }
}
