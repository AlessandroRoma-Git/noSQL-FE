import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { ToastService } from '../../../services/toast.service';
import { WhiteLabelService } from '../../../services/white-label.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base p-6 relative overflow-hidden">
      <!-- Background effects -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>

      <div class="w-full max-w-md z-10">
        <div class="bg-surface/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
          
          <!-- Logo & Header -->
          <div class="flex flex-col items-center mb-10 text-center">
            @if ((whiteLabelConfig$ | async)?.logoUrl) {
              <img [src]="(whiteLabelConfig$ | async)?.logoUrl" class="h-16 w-auto mb-6 drop-shadow-2xl" alt="Logo">
            }
            <h1 class="text-3xl font-black text-primary uppercase tracking-tighter leading-none mb-2">
              {{ (whiteLabelConfig$ | async)?.appName || 'CMS NOSQL' }}
            </h1>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] opacity-60">
              {{ i18nService.translate('LOGIN.SUBTITLE') }}
            </p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
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

            <!-- Password -->
            <div class="space-y-2">
              <div class="flex justify-between items-center px-4">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest block opacity-70">
                  {{ i18nService.translate('LOGIN.PASSWORD') }}
                </label>
                <a routerLink="/recover-password" class="text-[10px] font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors">
                  {{ i18nService.translate('LOGIN.FORGOT_PASSWORD') }}
                </a>
              </div>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <i class="fa-solid fa-lock text-sm"></i>
                </div>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  formControlName="password"
                  class="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-gray-600"
                  [placeholder]="i18nService.translate('LOGIN.PASSWORD')"
                >
                <button 
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-primary transition-colors"
                >
                  <i class="fa-solid" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="loginForm.invalid || loading"
              class="w-full bg-primary text-bg-base font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              @if (loading) {
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                {{ i18nService.translate('COMMON.LOADING') }}
              } @else {
                {{ i18nService.translate('LOGIN.BUTTON') }}
                <i class="fa-solid fa-arrow-right text-xs"></i>
              }
            </button>
          </form>

          <!-- Footer info -->
          <div class="mt-12 text-center">
            <p class="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] leading-relaxed">
              &copy; 2026 CMS NOSQL ENGINE<br>
              <span class="opacity-40">All rights reserved</span>
            </p>
          </div>

          <!-- Language selector -->
          <div class="absolute top-6 right-6 flex gap-2">
            <button (click)="setLang('it')" class="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all" [class.ring-2]="(i18nService.currentLang$ | async) === 'it'" [class.ring-primary]="(i18nService.currentLang$ | async) === 'it'">
              <span class="text-xs">🇮🇹</span>
            </button>
            <button (click)="setLang('en')" class="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all" [class.ring-2]="(i18nService.currentLang$ | async) === 'en'" [class.ring-primary]="(i18nService.currentLang$ | async) === 'en'">
              <span class="text-xs">🇬🇧</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus {
      -webkit-text-fill-color: rgb(var(--color-text));
      -webkit-box-shadow: 0 0 0px 1000px rgba(0,0,0,0.2) inset;
      transition: background-color 5000s ease-in-out 0s;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private whiteLabelService = inject(WhiteLabelService);
  public i18nService = inject(I18nService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  loading = false;
  showPassword = false;
  whiteLabelConfig$ = this.whiteLabelService.config$;

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success(this.i18nService.translate('COMMON.SUCCESS'));
      },
      error: (err: any) => {
        this.loading = false;
        this.toastService.error(err.error?.message || this.i18nService.translate('COMMON.ERROR'));
      }
    });
  }

  setLang(lang: string) {
    this.i18nService.setLanguage(lang);
  }
}
