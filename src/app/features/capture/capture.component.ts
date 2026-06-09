import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ExtractionService } from '../../core/services/extraction.service';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.scss',
})
export class CaptureComponent {
  private readonly extraction = inject(ExtractionService);
  private readonly router = inject(Router);

  readonly previewUrl = signal<string | null>(null);
  readonly extracting = signal(false);
  readonly error = signal<string | null>(null);

  private selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.clearPreview();
    this.error.set(null);
    this.selectedFile = file;
    this.previewUrl.set(URL.createObjectURL(file));
  }

  async extractText(): Promise<void> {
    if (!this.selectedFile || this.extracting()) return;

    this.extracting.set(true);
    this.error.set(null);

    try {
      const extracted = await this.extraction.extractFromImage(this.selectedFile);
      this.discardImage();
      await this.router.navigate(['/review'], { state: { extracted } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not extract text. Please try again.';
      this.error.set(message);
    } finally {
      this.extracting.set(false);
    }
  }

  discardImage(): void {
    this.clearPreview();
    this.selectedFile = null;
  }

  private clearPreview(): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set(null);
  }
}
