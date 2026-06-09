import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiaryEvent, DiaryNote, ExtractedNote } from '../../shared/models/diary.models';

interface DiaryNoteApiResponse {
  id: string;
  title: string;
  raw_text: string;
  extracted_json?: ExtractedNote;
  created_at: string;
  events: DiaryEvent[];
}

@Injectable({ providedIn: 'root' })
export class DiaryService {
  private readonly http = inject(HttpClient);

  private readonly notes = signal<DiaryNote[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly notesSignal = this.notes.asReadonly();

  constructor() {
    void this.refreshNotes();
  }

  getNotes(): DiaryNote[] {
    return this.notes();
  }

  getNote(id: string): DiaryNote | undefined {
    return this.notes().find((n) => n.id === id);
  }

  getEventsForMonth(notes: DiaryNote[], year: number, month: number): Array<DiaryEvent & { noteId: string; noteTitle: string }> {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    return notes.flatMap((note) =>
      note.events
        .filter((e) => {
          const d = new Date(e.event_date);
          return d >= start && d <= end;
        })
        .map((e) => ({ ...e, noteId: note.id, noteTitle: note.title }))
    );
  }

  async refreshNotes(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<DiaryNoteApiResponse[]>(`${environment.apiUrl}/api/notes`)
      );
      this.notes.set(response.map((note) => this.mapNote(note)));
    } catch (error) {
      this.error.set(this.toErrorMessage(error, 'Could not load notes.'));
    } finally {
      this.loading.set(false);
    }
  }

  async fetchNote(id: string): Promise<DiaryNote | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<DiaryNoteApiResponse>(`${environment.apiUrl}/api/notes/${id}`)
      );
      const note = this.mapNote(response);
      this.upsertLocal(note);
      return note;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return undefined;
      }
      this.error.set(this.toErrorMessage(error, 'Could not load note.'));
      return undefined;
    }
  }

  async saveNote(extracted: ExtractedNote): Promise<DiaryNote> {
    const payload = {
      title: extracted.title,
      raw_text: extracted.raw_text,
      categories: extracted.categories,
      events: extracted.events,
      metadata: extracted.metadata,
    };

    try {
      const response = await firstValueFrom(
        this.http.post<DiaryNoteApiResponse>(`${environment.apiUrl}/api/notes`, payload)
      );
      const note = this.mapNote(response);
      this.upsertLocal(note);
      return note;
    } catch (error) {
      throw new Error(this.toErrorMessage(error, 'Could not save note.'));
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/api/notes/${id}`));
      this.notes.update((current) => current.filter((note) => note.id !== id));
    } catch (error) {
      throw new Error(this.toErrorMessage(error, 'Could not delete note.'));
    }
  }

  private mapNote(note: DiaryNoteApiResponse): DiaryNote {
    return {
      id: note.id,
      title: note.title,
      raw_text: note.raw_text,
      extracted_json: note.extracted_json,
      created_at: note.created_at,
      events: note.events,
    };
  }

  private upsertLocal(note: DiaryNote): void {
    this.notes.update((current) => {
      const without = current.filter((item) => item.id !== note.id);
      return [note, ...without];
    });
  }

  private toErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      if (error.status === 0) {
        return 'Cannot reach API. Start the backend with: python main.py';
      }
      return `${fallback} (${error.status})`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  }
}
