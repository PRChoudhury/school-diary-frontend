export type EventType = 'homework' | 'test' | 'project' | 'event' | 'other';

export interface DiaryEvent {
  id?: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: EventType;
  reminder_lead_days?: number;
}

export interface StudentNoteItem {
  text: string;
  sub_points: string[];
}

export interface CategorizedNotes {
  teacher_notes: string[];
  student_notes: StudentNoteItem[];
}

export interface ExtractedNote {
  title: string;
  raw_text: string;
  categories: CategorizedNotes;
  events: DiaryEvent[];
  metadata?: {
    confidence?: number;
    uncertain_fields?: string[];
    summary?: string;
  };
}

export interface DiaryNote {
  id: string;
  title: string;
  raw_text: string;
  extracted_json?: ExtractedNote;
  created_at: string;
  events: DiaryEvent[];
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  email: string;
  phone: string;
  default_lead_days: number;
  default_lead_hours: number;
  timezone: string;
}
