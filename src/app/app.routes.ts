import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'capture' },
  {
    path: 'capture',
    loadComponent: () =>
      import('./features/capture/capture.component').then((m) => m.CaptureComponent),
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./features/review/review.component').then((m) => m.ReviewComponent),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./features/notes/notes.component').then((m) => m.NotesComponent),
  },
  {
    path: 'notes/:id',
    loadComponent: () =>
      import('./features/notes/note-detail.component').then((m) => m.NoteDetailComponent),
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '**', redirectTo: 'capture' },
];
