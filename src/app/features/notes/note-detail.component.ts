import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DiaryService } from '../../core/services/diary.service';
import { DiaryNote, StudentNoteItem } from '../../shared/models/diary.models';

@Component({
  selector: 'app-note-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './note-detail.component.html',
  styleUrl: './note-detail.component.scss',
})
export class NoteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly diary = inject(DiaryService);

  readonly note = signal<DiaryNote | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/notes']);
      return;
    }

    let found = this.diary.getNote(id);
    if (!found) {
      found = await this.diary.fetchNote(id);
    }
    if (!found) {
      void this.router.navigate(['/notes']);
      return;
    }
    this.note.set(found);
  }

  getStudentNoteText(item: StudentNoteItem | string): string {
    return typeof item === 'string' ? item : item.text;
  }

  getStudentSubPoints(item: StudentNoteItem | string): string[] {
    return typeof item === 'string' ? [] : (item.sub_points ?? []);
  }

  async deleteNote(): Promise<void> {
    const n = this.note();
    if (!n || !confirm('Delete this note and its events?')) return;

    try {
      await this.diary.deleteNote(n.id);
      void this.router.navigate(['/notes']);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not delete note.');
    }
  }
}
