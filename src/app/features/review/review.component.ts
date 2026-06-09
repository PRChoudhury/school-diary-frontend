import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DiaryService } from '../../core/services/diary.service';
import { DiaryEvent, EventType, ExtractedNote, StudentNoteItem } from '../../shared/models/diary.models';

@Component({
  selector: 'app-review',
  imports: [FormsModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent implements OnInit {
  private readonly diary = inject(DiaryService);
  private readonly router = inject(Router);

  readonly eventTypes: EventType[] = ['homework', 'test', 'project', 'event', 'other'];

  title = '';
  teacherNotes = signal<string[]>([]);
  studentNotes = signal<StudentNoteItem[]>([]);
  events = signal<DiaryEvent[]>([]);
  uncertainFields = signal<string[]>([]);
  summary = signal('');
  saving = signal(false);
  saveError = signal<string | null>(null);

  ngOnInit(): void {
    const state = history.state as { extracted?: ExtractedNote };
    if (!state?.extracted) {
      void this.router.navigate(['/capture']);
      return;
    }

    const { extracted } = state;
    this.title = extracted.title;
    this.teacherNotes.set(structuredClone(extracted.categories?.teacher_notes ?? []));
    this.studentNotes.set(this.normalizeStudentNotes(extracted.categories?.student_notes ?? []));
    this.events.set(structuredClone(extracted.events));
    this.uncertainFields.set(extracted.metadata?.uncertain_fields ?? []);
    this.summary.set(extracted.metadata?.summary ?? '');
  }

  private normalizeStudentNotes(notes: StudentNoteItem[] | string[]): StudentNoteItem[] {
    return notes.map((note) =>
      typeof note === 'string' ? { text: note, sub_points: [] } : { text: note.text, sub_points: [...(note.sub_points ?? [])] }
    );
  }

  updateTeacherNote(index: number, value: string): void {
    this.teacherNotes.update((notes) => {
      const copy = [...notes];
      copy[index] = value;
      return copy;
    });
  }

  addTeacherNote(): void {
    this.teacherNotes.update((notes) => [...notes, '']);
  }

  removeTeacherNote(index: number): void {
    this.teacherNotes.update((notes) => notes.filter((_, i) => i !== index));
  }

  updateStudentNoteText(index: number, value: string): void {
    this.studentNotes.update((notes) => {
      const copy = [...notes];
      copy[index] = { ...copy[index], text: value };
      return copy;
    });
  }

  updateStudentSubPoint(noteIndex: number, subIndex: number, value: string): void {
    this.studentNotes.update((notes) => {
      const copy = [...notes];
      const subPoints = [...copy[noteIndex].sub_points];
      subPoints[subIndex] = value;
      copy[noteIndex] = { ...copy[noteIndex], sub_points: subPoints };
      return copy;
    });
  }

  addStudentSubPoint(noteIndex: number): void {
    this.studentNotes.update((notes) => {
      const copy = [...notes];
      copy[noteIndex] = {
        ...copy[noteIndex],
        sub_points: [...copy[noteIndex].sub_points, ''],
      };
      return copy;
    });
  }

  removeStudentSubPoint(noteIndex: number, subIndex: number): void {
    this.studentNotes.update((notes) => {
      const copy = [...notes];
      copy[noteIndex] = {
        ...copy[noteIndex],
        sub_points: copy[noteIndex].sub_points.filter((_, i) => i !== subIndex),
      };
      return copy;
    });
  }

  addStudentNote(): void {
    this.studentNotes.update((notes) => [...notes, { text: '', sub_points: [] }]);
  }

  removeStudentNote(index: number): void {
    this.studentNotes.update((notes) => notes.filter((_, i) => i !== index));
  }

  toLocalInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  onDateChange(index: number, localValue: string): void {
    this.updateEvent(index, 'event_date', new Date(localValue).toISOString());
  }

  updateEvent(index: number, field: keyof DiaryEvent, value: string): void {
    this.events.update((list) => {
      const copy = [...list];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  removeEvent(index: number): void {
    this.events.update((list) => list.filter((_, i) => i !== index));
  }

  addEvent(): void {
    this.events.update((list) => [
      ...list,
      {
        title: '',
        event_date: new Date().toISOString().slice(0, 16),
        event_type: 'other',
      },
    ]);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);

    const teacherNotes = this.teacherNotes().map((n) => n.trim()).filter(Boolean);
    const studentNotes = this.studentNotes()
      .map((n) => ({
        text: n.text.trim(),
        sub_points: n.sub_points.map((p) => p.trim()).filter(Boolean),
      }))
      .filter((n) => n.text);

    const extracted: ExtractedNote = {
      title: this.title,
      raw_text: this.buildRawText(teacherNotes, studentNotes),
      categories: { teacher_notes: teacherNotes, student_notes: studentNotes },
      events: this.events(),
      metadata: {
        uncertain_fields: this.uncertainFields(),
        summary: this.summary(),
      },
    };

    try {
      const note = await this.diary.saveNote(extracted);
      void this.router.navigate(['/notes', note.id]);
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : 'Could not save note.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    void this.router.navigate(['/capture']);
  }

  private buildRawText(teacherNotes: string[], studentNotes: StudentNoteItem[]): string {
    const parts: string[] = [];
    if (teacherNotes.length) {
      parts.push('Teacher notes :\n' + teacherNotes.map((n) => `- ${n}`).join('\n'));
    }
    if (studentNotes.length) {
      const lines = studentNotes.map((n) => {
        const subs = n.sub_points.map((p) => `  - ${p}`).join('\n');
        return subs ? `- ${n.text}\n${subs}` : `- ${n.text}`;
      });
      parts.push('Student notes :\n' + lines.join('\n'));
    }
    return parts.join('\n\n');
  }
}
