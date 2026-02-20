
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FileService } from '../../core/services/file.service';
import { FileMetadata } from '../../core/models/file.model';
import { ModalService } from '../../core/services/modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-list.component.html',
})
export class FileListComponent implements OnInit {
  private fileService = inject(FileService);
  private modalService = inject(ModalService);
  public files$!: Observable<FileMetadata[]>;
  public uploadProgress: number | null = null;

  ngOnInit(): void {
    this.files$ = this.fileService.files$;
    this.fileService.loadFiles().subscribe();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadProgress = 0;
      this.fileService.uploadFile(file).subscribe(progressOrFile => {
        if (typeof progressOrFile === 'number') {
          this.uploadProgress = progressOrFile;
        } else {
          this.uploadProgress = null;
        }
      });
    }
  }

  onDelete(id: string, filename: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete the file <strong>${filename}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.fileService.deleteFile(id).subscribe();
    });
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
