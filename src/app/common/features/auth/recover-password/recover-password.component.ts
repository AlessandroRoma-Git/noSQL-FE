import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base p-6 relative overflow-hidden">
      <!-- Background effects -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>

      <div class="w-full max-w-md z-10">
        <div class="bg-surface/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          
          <!-- Header -->
          <div class="flex flex-col items-center mb-10 text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
              <i class="fa-solid fa-key text-2xl"></i>
            </div>
            <h1 class="text-3xl font-black text-primary uppercase tracking-tighter leading-none mb-2">
              {{ i18nService.translate('LOGIN.FORGOT_PASSWORD') }}
            </h1>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-widest opacity-60 px-4">
              Inserisci il tuo username per ricevere una nuova password via email.
            </p>
          </div>

          <form [formGroup]="recoverForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Username -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block opacity-70">
                {{ i18nService.translate('LOGIN.USERNAME') }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <i class="fa-solid fa-user text-sm"></i>
                </div>
                <input 
                  type="text" 
                  formControlName="username"
                  class="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-gray-600"
                  [placeholder]="i18nService.translate('LOGIN.USERNAME')"
                >
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="recoverForm.invalid || loading"
              class="w-full bg-primary text-bg-base font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              @if (loading) {
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                {{ i18nService.translate('COMMON.LOADING') }}
              } @else {
                Invia Nuova Password
                <i class="fa-solid fa-paper-plane text-xs"></i>
              }
            </button>

            <!-- Back to login -->
            <div class="text-center pt-4">
              <a routerLink="/login" class="text-xs font-black text-gray-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <i class="fa-solid fa-arrow-left"></i>
                Torna al Login
              </a>
            </div>
          </form>

        </div>
      </div>
    </div>
  `
})
export class RecoverPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  public i18nService = inject(I18nService);

  recoverForm = this.fb.group({
    username: ['', [Validators.required]]
  });

  loading = false;

  onSubmit() {
    if (this.recoverForm.invalid) return;

    this.loading = true;
    this.authService.recoverPassword(this.recoverForm.value as any).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.toastService.success(res.message || this.i18nService.translate('COMMON.SUCCESS'));
      },
      error: (err: any) => {
        this.loading = false;
        this.toastService.error(err.error?.message || this.i18nService.translate('COMMON.ERROR'));
      }
    });
  }
}
