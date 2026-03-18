import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-omnium-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <!-- Omnium Background Orbs (Restored) -->
    <div class="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050505]">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/10 blur-[120px]"></div>
    </div>

    <!-- Main Content Area -->
    <main class="relative z-0 min-h-screen flex flex-col pt-20 container mx-auto px-4 flex-1">
      <router-outlet></router-outlet>
    </main>

    <!-- Omnium Specific Footer -->
    <footer class="mt-auto border-t border-white/5 bg-black/40 backdrop-blur-sm py-8 text-center text-neutral-500 text-sm">
      <div class="flex items-center justify-center gap-2 mb-2 opacity-50">
        <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
        <span class="text-xl gaming-font tracking-widest text-white uppercase">OMNIUM</span>
        <span class="w-2 h-2 rounded-full bg-fuchsia-500"></span>
      </div>
      <p class="font-light italic">Designed for the next generation of esports.</p>
    </footer>
  `
})
export class OmniumLayoutComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  store = inject(StoreService);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.store.loadAllRecords();
    }
  }
}
