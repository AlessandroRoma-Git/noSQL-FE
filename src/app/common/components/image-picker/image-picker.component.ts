import { Component, forwardRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { FileService } from 'app/consumer-app/services/file.service';
import { I18nService } from 'app/common/services/i18n.service';
import { ToastService } from 'app/common/services/toast.service';

@Component({
  selector: 'app-image-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-3">
      <!-- AREA DI CARICAMENTO / ANTEPRIMA -->
      <div 
        (click)="fileInput.click()"
        class="relative w-full h-56 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 overflow-hidden group cursor-pointer hover:border-[rgb(var(--color-primary)/0.5)] transition-all flex items-center justify-center"
        [class.border-[rgb(var(--color-primary))]]="value()"
        [class.bg-[rgb(var(--color-primary)/0.02)]]="value()">
        
        @if (value()) {
          <!-- Visualizzazione Immagine Caricata -->
          <img [src]="value()" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Anteprima">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <div class="flex flex-col items-center gap-2">
               <i class="fa-solid fa-cloud-arrow-up text-3xl text-white"></i>
               <span class="text-xs font-black text-white uppercase tracking-widest">Cambia Immagine</span>
            </div>
          </div>
          
          <!-- Bottone Rimuovi -->
          <button type="button" (click)="clearValue($event)" class="absolute top-4 right-4 z-30 p-3 rounded-2xl bg-red-500 text-white shadow-2xl hover:scale-110 transition-transform">
            <i class="fa-solid fa-xmark"></i>
          </button>
        } @else {
          <!-- Stato Vuoto: Invito al Caricamento -->
          <div class="flex flex-col items-center gap-4 text-center p-6">
            <div class="w-16 h-16 rounded-3xl bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] flex items-center justify-center text-2xl shadow-inner">
              <i class="fa-solid fa-images"></i>
            </div>
            <div>
              <p class="text-sm font-black text-white uppercase tracking-tight">Trascina o clicca per caricare</p>
              <p class="text-[10px] text-gray-500 font-medium mt-1">PNG, JPG, WEBP fino a 5MB</p>
            </div>
          </div>
        }

        <!-- Overlay Caricamento -->
        @if (isUploading()) {
          <div class="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-40">
            <div class="w-12 h-12 rounded-full border-4 border-white/10 border-t-[rgb(var(--color-primary))] animate-spin mb-4"></div>
            <span class="text-[10px] font-black text-[rgb(var(--color-primary))] uppercase tracking-widest">Caricamento in corso...</span>
          </div>
        }
      </div>

      <!-- OPZIONE URL (Nascosta in un toggle o piccola sotto) -->
      <div class="px-2">
        <button type="button" (click)="showUrlInput.set(!showUrlInput())" class="text-[9px] font-black text-gray-500 hover:text-[rgb(var(--color-primary))] uppercase tracking-widest transition-colors flex items-center gap-2">
          <i class="fa-solid fa-link"></i>
          {{ showUrlInput() ? 'Nascondi URL' : 'Oppure inserisci un URL manuale' }}
        </button>
        
        @if (showUrlInput()) {
          <input 
            type="text" 
            [ngModel]="value()" 
            (ngModelChange)="onUrlChange($event)"
            class="input h-10 text-[10px] mt-2 animate-soft-in" 
            placeholder="https://esempio.it/immagine.jpg">
        }
      </div>

      <input 
        #fileInput
        type="file" 
        (change)="onFileSelected($event)" 
        accept="image/*"
        class="hidden">
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImagePickerComponent),
      multi: true
    }
  ]
})
export class ImagePickerComponent implements ControlValueAccessor {
  private fileService = inject(FileService);
  public i18nService = inject(I18nService);
  private toastService = inject(ToastService);

  value = signal<string>('');
  isUploading = signal<boolean>(false);
  showUrlInput = signal<boolean>(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onUrlChange(newUrl: string): void {
    this.value.set(newUrl);
    this.onChange(newUrl);
  }

  clearValue(event: Event): void {
    event.stopPropagation(); // Evita di triggerare il click del parent (caricamento)
    this.value.set('');
    this.onChange('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
    // Resettiamo l'input per permettere di selezionare lo stesso file
    input.value = '';
  }

  private uploadFile(file: File): void {
    this.isUploading.set(true);
    
    this.fileService.uploadFile(file).subscribe({
      next: (metadata) => {
        const url = this.fileService.getFileUrl(metadata.id);
        this.value.set(url);
        this.onChange(url);
        this.isUploading.set(false);
        this.toastService.success('Immagine caricata correttamente!');
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.isUploading.set(false);
        this.toastService.error('Errore durante il caricamento.');
      }
    });
  }
}
