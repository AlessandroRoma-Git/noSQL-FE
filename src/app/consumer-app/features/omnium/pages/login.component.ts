import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from 'app/common/services/auth.service';
import { LoginRequest } from 'app/common/models/auth.model';
import { WhiteLabelService, WhiteLabelConfig } from 'app/common/services/white-label.service';
import { I18nService } from 'app/common/services/i18n.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
      
      <!-- BACKGROUND AMBIENCE (Global) -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
             class="w-full h-full object-cover scale-110 animate-slow-zoom opacity-20 grayscale-[0.5]" alt="Arena">
        <div class="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent"></div>
      </div>

      <!-- LEFT COLUMN: BRANDING (Visual Hub) -->
      <div class="hidden lg:flex lg:w-[55%] flex-col items-center justify-center p-20 z-10 relative">
        <div class="space-y-6 animate-soft-in">
          <h1 class="text-[10rem] xl:text-[13rem] font-black gaming-font tracking-tighter text-white leading-none uppercase italic drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            {{ (config$ | async)?.appName || 'OMNIUM' }}
          </h1>
          <div class="flex items-center gap-8 pl-4">
            <span class="h-px w-32 bg-cyan-500 shadow-[0_0_15px_#22d3ee]"></span>
            <p class="text-cyan-400 font-black uppercase tracking-[0.8em] text-sm italic">Protocol: Dominance</p>
          </div>
        </div>
        
        <!-- Decorative element -->
        <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <!-- RIGHT COLUMN: LOGIN INTERFACE -->
      <div class="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 z-20 relative">
        
        <div class="w-full max-w-xl animate-soft-in">
          
          <!-- MOBILE HEADER (Only on small screens) -->
          <div class="lg:hidden text-center mb-12 space-y-4">
             <h1 class="text-7xl font-black gaming-font tracking-tighter text-white leading-none uppercase italic">OMNIUM</h1>
             <p class="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px]">The Arena Awaits</p>
          </div>

          <!-- AUTH PANEL -->
          <div class="bg-[#0a0a0f]/60 border border-white/10 backdrop-blur-3xl rounded-[4rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <!-- Glass Glow -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700"></div>
            
            <div class="space-y-12 relative z-10">
              
              <div class="space-y-4 text-center lg:text-left">
                <h2 class="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Access <span class="text-cyan-400 italic">Portal</span></h2>
                <p class="text-gray-500 text-sm font-medium italic tracking-wide">Sync your neural profile to initialize combat status.</p>
              </div>

              <!-- PRIMARY ACTION: DISCORD -->
              <div class="space-y-6">
                <button (click)="loginWithDiscord()" class="w-full h-24 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-[2.5rem] flex items-center justify-center gap-6 shadow-[0_20px_60px_rgba(88,101,242,0.25)] transition-all hover:scale-[1.03] active:scale-95 group">
                  <i class="fa-brands fa-discord text-5xl"></i>
                  <div class="text-left">
                    <p class="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] leading-none mb-1.5">Authorized Identity</p>
                    <p class="text-2xl font-black uppercase tracking-widest leading-none">Discord Connect</p>
                  </div>
                </button>
                <div class="flex items-center justify-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                  <p class="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">Secure OAuth Node Ready</p>
                </div>
              </div>

              <!-- STAFF PORTAL TOGGLE -->
              <div class="flex items-center gap-6">
                <div class="h-px bg-white/5 flex-grow"></div>
                <button (click)="showStaffLogin.set(!showStaffLogin())" 
                        class="text-[9px] font-black uppercase tracking-[0.4em] transition-all hover:text-white"
                        [class.text-cyan-400]="showStaffLogin()"
                        [class.text-gray-700]="!showStaffLogin()">
                  {{ showStaffLogin() ? 'Terminal Close' : 'Staff Login' }}
                </button>
                <div class="h-px bg-white/5 flex-grow"></div>
              </div>

              <!-- STAFF FORM -->
              @if (showStaffLogin()) {
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-8 animate-soft-in">
                  <div class="space-y-6">
                    <div class="space-y-3">
                      <label class="text-[9px] uppercase font-black tracking-[0.3em] text-gray-600 ml-6 italic">Operator Designation</label>
                      <input formControlName="username" type="text" class="input !h-16 !rounded-3xl border-white/5 bg-white/[0.02] italic font-black text-white focus:border-cyan-500 transition-all uppercase tracking-widest placeholder:text-gray-800" placeholder="DE-ID">
                    </div>
                    <div class="space-y-3">
                      <label class="text-[9px] uppercase font-black tracking-[0.3em] text-gray-600 ml-6 italic">Security Key</label>
                      <input formControlName="password" type="password" class="input !h-16 !rounded-3xl border-white/5 bg-white/[0.02] italic font-black text-white focus:border-cyan-500 transition-all placeholder:text-gray-800" placeholder="••••••••">
                    </div>
                  </div>

                  @if (errorMessage) {
                    <div class="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black text-center uppercase tracking-widest animate-pulse">
                      <i class="fa-solid fa-triangle-exclamation mr-2"></i> {{ errorMessage }}
                    </div>
                  }

                  <div class="flex flex-col sm:flex-row items-center justify-between gap-8 pt-4">
                    <a routerLink="/recover-password" class="text-[9px] font-black text-gray-600 hover:text-cyan-400 uppercase tracking-[0.3em] transition-colors italic">Recovery Node</a>
                    <button type="submit" [disabled]="loginForm.invalid" class="w-full sm:w-auto px-16 h-16 bg-white text-black rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                      Login
                    </button>
                  </div>
                </form>
              }

              <!-- FOOTER -->
              <footer class="pt-8 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-[8px] font-black text-gray-700 uppercase tracking-widest italic border-t border-white/5">
                <a href="#" class="hover:text-white transition-colors">Combat Terms</a>
                <a href="#" class="hover:text-white transition-colors">Privacy Shield</a>
                <a href="#" class="hover:text-white transition-colors">Support Node</a>
              </footer>

            </div>
          </div>
        </div>
      </div>

      <!-- DECORATIVE GLOWS -->
      <div class="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-fuchsia-500/5 rounded-full blur-[150px] -z-10 animate-pulse"></div>
    </div>
  `,
  styles: [`
    @keyframes slow-zoom {
      from { transform: scale(1.05); }
      to { transform: scale(1.15); }
    }
    .animate-slow-zoom { animation: slow-zoom 40s infinite alternate ease-in-out; }
    :host { display: block; }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private whiteLabelService = inject(WhiteLabelService);
  public i18nService = inject(I18nService);

  public config$!: Observable<WhiteLabelConfig>;
  showStaffLogin = signal(false);
  errorMessage: string | null = null;

  loginForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
  }>;

  constructor() {
    this.loginForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.config$ = this.whiteLabelService.config$;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.getRawValue() as LoginRequest).subscribe({
        error: () => this.errorMessage = 'IDENTITY VERIFICATION FAILED'
      });
    }
  }

  loginWithDiscord(): void {
    alert('ESTABLISHING SECURE LINK: Redirecting to Discord authorization node...');
  }
}
