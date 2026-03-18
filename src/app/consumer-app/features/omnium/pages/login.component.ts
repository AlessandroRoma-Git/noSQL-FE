import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/common/services/auth.service';
import { StoreService } from '../services/store.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden bg-[#050505]">
      
      <!-- Ambient Background Decor -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div class="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-10">
           <div class="inline-flex items-center gap-3 mb-6">
              <span class="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
              <h1 class="text-4xl gaming-font tracking-[0.2em] text-white">OMNIUM</h1>
              <span class="w-3 h-3 rounded-full bg-fuchsia-500 animate-pulse delay-75 shadow-[0_0_10px_rgba(217,70,239,0.8)]"></span>
           </div>
           <p class="text-gray-400 font-light tracking-widest text-sm uppercase">Secure Access Terminal</p>
        </div>

        <div class="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
           
           <!-- Decorative inner glow -->
           <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

           <form (ngSubmit)="handleLogin()" #loginForm="ngForm" class="space-y-6 relative z-10">
              
              <div class="space-y-2">
                 <label class="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Username</label>
                 <div class="relative group/input">
                    <input 
                       type="text" 
                       name="username" 
                       [(ngModel)]="credentials.username"
                       required
                       class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
                       placeholder="Enter identification">
                    <div class="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                 </div>
              </div>

              <div class="space-y-2">
                 <label class="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest ml-1">Access Code</label>
                 <div class="relative group/input">
                    <input 
                       type="password" 
                       name="password" 
                       [(ngModel)]="credentials.password"
                       required
                       class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-gray-600"
                       placeholder="••••••••">
                    <div class="absolute inset-0 rounded-xl bg-fuchsia-500/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                 </div>
              </div>

              @if (error()) {
                 <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="text-xs text-red-400 font-medium">{{ error() }}</span>
                 </div>
              }

              <button 
                 type="submit" 
                 [disabled]="loading() || !loginForm.valid"
                 class="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-cyan-500/20">
                 @if (loading()) {
                    <span class="flex items-center justify-center gap-2">
                       Authenticating...
                    </span>
                 } @else {
                    Initialize Session
                 }
              </button>

           </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(StoreService);

  credentials = {
    username: '',
    password: ''
  };

  loading = signal(false);
  error = signal<string | null>(null);

  handleLogin() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.authService.systemRoles$.pipe(take(1)).subscribe(roles => {
          this.loading.set(false);
          this.store.addNotification(`Welcome back, ${res.username}`, 'success');
          
          if (roles.includes('SUPER_ADMIN')) {
            this.router.navigate(['/settings']);
          } else {
            this.router.navigate(['/app/dashboard']);
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Authentication failed.');
      }
    });
  }
}
