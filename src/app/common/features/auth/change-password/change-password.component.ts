import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base p-6 relative overflow-hidden">
      <!-- Background effects -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>

      <div class="w-full max-w-lg z-10">
        <div class="bg-surface/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          
          <!-- Header -->
          <div class="flex flex-col items-center mb-10 text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
              <i class="fa-solid fa-shield-halved text-2xl"></i>
            </div>
            <h1 class="text-3xl font-black text-primary uppercase tracking-tighter leading-none mb-2">
              {{ i18nService.translate('CHANGE_PASSWORD.TITLE') }}
            </h1>
            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60 px-8 leading-relaxed">
              {{ i18nService.translate('CHANGE_PASSWORD.SUBTITLE') }}
            </p>
          </div>

          <form [formGroup]="changeForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Old Password -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block opacity-70">
                {{ i18nService.translate('CHANGE_PASSWORD.OLD_PASSWORD') }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <i class="fa-solid fa-lock-open text-sm"></i>
                </div>
                <input 
                  type="password" 
                  formControlName="oldPassword"
                  class="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-gray-600"
                  [placeholder]="i18nService.translate('CHANGE_PASSWORD.OLD_PASSWORD')"
                >
              </div>
            </div>

            <!-- New Password -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block opacity-70">
                {{ i18nService.translate('CHANGE_PASSWORD.NEW_PASSWORD') }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <i class="fa-solid fa-key text-sm"></i>
                </div>
                <input 
                  type="password" 
                  formControlName="newPassword"
                  class="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-gray-600"
                  [placeholder]="i18nService.translate('CHANGE_PASSWORD.NEW_PASSWORD')"
                >
              </div>
              @if (changeForm.get('newPassword')?.touched && changeForm.get('newPassword')?.hasError('minlength')) {
                <div class="text-[9px] font-black text-red-500 uppercase tracking-widest ml-4 mt-1">
                  {{ i18nService.translate('CHANGE_PASSWORD.MIN_LENGTH') }}
                </div>
              }
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block opacity-70">
                {{ i18nService.translate('CHANGE_PASSWORD.CONFIRM_PASSWORD') }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <i class="fa-solid fa-check-double text-sm"></i>
                </div>
                <input 
                  type="password" 
                  formControlName="confirmPassword"
                  class="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-gray-600"
                  [placeholder]="i18nService.translate('CHANGE_PASSWORD.CONFIRM_PASSWORD')"
                >
              </div>
              @if (changeForm.hasError('mismatch') && changeForm.get('confirmPassword')?.touched) {
                <div class="text-[9px] font-black text-red-500 uppercase tracking-widest ml-4 mt-1">
                  {{ i18nService.translate('CHANGE_PASSWORD.MISMATCH') }}
                </div>
              }
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="changeForm.invalid || loading"
              class="w-full bg-primary text-bg-base font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              @if (loading) {
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                {{ i18nService.translate('COMMON.LOADING') }}
              } @else {
                {{ i18nService.translate('CHANGE_PASSWORD.BUTTON') }}
                <i class="fa-solid fa-check text-xs"></i>
              }
            </button>
          </form>

        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  public i18nService = inject(I18nService);
  private router = inject(Router);

  changeForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  loading = false;

  passwordMatchValidator(g: any) {
    return g.get('newPassword').value === g.get('confirmPassword').value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.changeForm.invalid) return;

    this.loading = true;
    const { oldPassword, newPassword } = this.changeForm.value;
    this.authService.changePassword({ oldPassword, newPassword } as any).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success(this.i18nService.translate('CHANGE_PASSWORD.SUCCESS'));
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastService.error(err.error?.message || this.i18nService.translate('COMMON.ERROR'));
      }
    });
  }
}
