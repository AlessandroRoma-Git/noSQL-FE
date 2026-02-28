
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../core/services/file.service';
import { ModalService } from '../../core/services/modal.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-list.component.html',
})
export class FileListComponent {
  private fileService = inject(FileService);
  private modalService = inject(ModalService);
  private i18nService = inject(I18nService);

  public uploadProgress: number | null = null;
  public lastUploadedFile: { filename: string, id: string } | null = null;

  showHelp(): void {
    const info = this.i18nService.translate('HELP.FILES');
    this.modalService.openInfo('Guida Rapida: File', info);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadProgress = 0;
      this.lastUploadedFile = null;

      this.fileService.uploadFile(file).subscribe(progressOrFile => {
        if (typeof progressOrFile === 'number') {
          this.uploadProgress = progressOrFile;
        } else {
          this.uploadProgress = null;
          this.lastUploadedFile = { filename: progressOrFile.filename, id: progressOrFile.id };
          this.modalService.openInfo('Success', `File '${progressOrFile.filename}' uploaded successfully.`);
        }
      });
    }
  }
}
