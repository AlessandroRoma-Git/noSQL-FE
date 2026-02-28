import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from 'app/common/services/toast.service';
import { Observable } from 'rxjs';

/**
 * @class ToastComponent
 * @description
 * Questo componente è il "palco" dove vengono mostrati i messaggini Toast.
 * È invisibile finché non c'è un messaggio da far vedere in un angolo.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of toasts$ | async; track toast.id) {
        <div 
          class="toast-card pointer-events-auto flex items-center p-4 rounded-lg shadow-xl min-w-[300px] max-w-md animate-toast-in"
          [ngClass]="{
            'bg-red-500 text-white': toast.type === 'error',
            'bg-green-500 text-white': toast.type === 'success',
            'bg-blue-500 text-white': toast.type === 'info',
            'bg-yellow-500 text-white': toast.type === 'warning'
          }"
        >
          <div class="flex-grow font-medium">
            {{ toast.message }}
          </div>
          <button (click)="remove(toast.id)" class="ml-4 hover:opacity-75 focus:outline-none">
            <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes toast-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-toast-in {
      animation: toast-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class ToastComponent {
  private toastService = inject(ToastService);
  public toasts$: Observable<ToastMessage[]> = this.toastService.toasts$;

  /**
   * Rimuove manualmente un Toast quando clicchi sulla "X".
   */
  remove(id: number) {
    this.toastService.remove(id);
  }
}
