import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiaryEvent, EventType, ExtractedNote } from '../../shared/models/diary.models';

interface ExtractionApiResponse {
  title: string;
  raw_text: string;
  summary: string;
  categories: {
    teacher_notes: string[];
    student_notes: Array<{
      text: string;
      sub_points?: string[];
    }>;
  };
  events: Array<{
    title: string;
    description?: string;
    event_date: string;
    event_type: string;
    reminder_lead_days?: number;
  }>;
  metadata: {
    day?: string;
    date?: string;
    uncertain_fields?: string[];
  };
}

const EVENT_TYPES: EventType[] = ['homework', 'test', 'project', 'event', 'other'];

@Injectable({ providedIn: 'root' })
export class ExtractionService {
  private readonly http = inject(HttpClient);

  async extractFromImage(file: File): Promise<ExtractedNote> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    try {
      const response = await firstValueFrom(
        this.http.post<ExtractionApiResponse>(`${environment.apiUrl}/api/extract`, formData)
      );
      return this.mapResponse(response);
    } catch (error) {
      throw new Error(this.toErrorMessage(error));
    }
  }

  private mapResponse(response: ExtractionApiResponse): ExtractedNote {
    return {
      title: response.title,
      raw_text: response.raw_text,
      categories: {
        teacher_notes: response.categories.teacher_notes ?? [],
        student_notes: (response.categories.student_notes ?? []).map((note) => ({
          text: note.text,
          sub_points: note.sub_points ?? [],
        })),
      },
      events: response.events.map((event) => ({
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        event_type: this.asEventType(event.event_type),
        reminder_lead_days: event.reminder_lead_days,
      })),
      metadata: {
        uncertain_fields: response.metadata.uncertain_fields ?? [],
        summary: response.summary,
      },
    };
  }

  private asEventType(value: string): EventType {
    return EVENT_TYPES.includes(value as EventType) ? (value as EventType) : 'other';
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      if (error.status === 0) {
        return 'Cannot reach extraction API. Start the backend with: python main.py';
      }
      return `Extraction failed (${error.status}).`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Could not extract text. Please try again.';
  }
}
