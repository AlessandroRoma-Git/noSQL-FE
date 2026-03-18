import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoreService } from '../services/store.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full">
      
      <!-- Minimalist Hero -->
      <header class="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
           <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
           <img src="https://picsum.photos/seed/cyberpunk/1600/900" class="w-full h-full object-cover opacity-40" alt="Hero Background">
        </div>
        
        <div class="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-8">
          <h1 class="text-7xl md:text-9xl font-bold gaming-font tracking-tight text-white leading-none">
            <span >OMNIUM</span>
          </h1>
          <p class="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            La piattaforma competitiva di nuova generazione. Design essenziale, performance estreme. Iscriviti, competi, domina.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
             <button routerLink="/app/competitions" class="px-8 py-4 rounded-xl bg-white text-black font-bold tracking-wider hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              ESPLORA TORNEI
            </button>
             <button class="px-8 py-4 rounded-xl glass-panel text-white font-medium hover:bg-white/10 transition-colors">
              SCOPRI DI PIÙ
            </button>
          </div>
        </div>
      </header>

      <div class="w-full px-6 py-24 space-y-32">
        
        <!-- Games Section -->
        <section>
          <div class="flex items-end justify-between mb-12">
            <div>
              <h2 class="text-4xl gaming-font text-white mb-2">TITOLI IN EVIDENZA</h2>
              <div class="h-1 w-12 bg-cyan-500 rounded-full"></div>
            </div>
            <a class="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">VEDI TUTTI</a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (title of store.titles(); track title.id) {
              <div [routerLink]="['/app/titles', title.id]" class="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                <img [src]="title.image" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" alt="Game">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                
                <div class="absolute bottom-0 left-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p class="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{{ title.publisher }}</p>
                  <h3 class="text-3xl gaming-font text-white">{{ title.name }}</h3>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Active Competitions -->
        <section>
           <div class="flex items-end justify-between mb-12">
            <div>
              <h2 class="text-4xl gaming-font text-white mb-2">TORNEI LIVE</h2>
              <div class="h-1 w-12 bg-fuchsia-500 rounded-full"></div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            @for (comp of store.activeCompetitions(); track comp.id) {
              <div class="glass-panel p-1 rounded-2xl hover:border-fuchsia-500/30 transition-colors group">
                <div class="relative h-48 rounded-xl overflow-hidden mb-4">
                  <div class="absolute top-3 right-3 px-3 py-1 bg-red-500/90 text-white text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-sm z-10 shadow-lg">Live Now</div>
                  <img [src]="comp.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                
                <div class="p-4">
                  <h3 class="text-xl font-bold text-white mb-2">{{ comp.name }}</h3>
                  <div class="flex justify-between items-center text-sm text-gray-400 mb-6">
                    <span>Prize Pool</span>
                    <span class="text-white font-mono">{{ comp.prizePool }}</span>
                  </div>
                  <button [routerLink]="['/app/competitions', comp.id]" class="w-full py-3 rounded-lg bg-white/5 hover:bg-white text-gray-300 hover:text-black font-semibold transition-all text-sm">
                    Dettagli
                  </button>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Minimal Partners -->
        <section class="border-t border-white/5 pt-16 pb-8">
          <p class="text-center text-gray-600 text-xs font-bold uppercase tracking-[0.3em] mb-12">Trusted By</p>
          <div class="flex justify-center gap-16 flex-wrap grayscale opacity-30 hover:opacity-100 transition-opacity duration-500">
             <span class="text-2xl font-bold font-mono">ALIENWARE</span>
             <span class="text-2xl font-bold font-mono">LOGITECH</span>
             <span class="text-2xl font-bold font-mono">RED BULL</span>
             <span class="text-2xl font-bold font-mono">DISCORD</span>
          </div>
        </section>

      </div>
    </div>
  `
})
export class HomeComponent {
  store = inject(StoreService);
}