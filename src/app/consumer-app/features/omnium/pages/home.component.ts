import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
      
      <!-- CINEMATIC HERO -->
      <header class="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
           <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
           <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
                class="w-full h-full object-cover scale-105 animate-slow-zoom opacity-40" alt="Arena Background">
        </div>
        
        <div class="relative z-20 text-center px-6 max-w-5xl mx-auto space-y-10 animate-soft-in">
          <div class="flex items-center justify-center gap-4 mb-4">
            <span class="h-px w-12 bg-cyan-500/50"></span>
            <span class="text-cyan-400 font-black text-xs tracking-[0.5em] uppercase">The Next Generation</span>
            <span class="h-px w-12 bg-cyan-500/50"></span>
          </div>
          <h1 class="text-7xl md:text-[10rem] font-black gaming-font tracking-tighter text-white leading-none italic uppercase">
            OMNIUM
          </h1>
          <p class="text-lg md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed italic">
            Command your destiny. Compete in elite tournaments, join legendary squads, and dominate the digital arena.
          </p>
          <div class="flex flex-col sm:flex-row gap-6 justify-center pt-8">
             <button routerLink="/app/competitions" class="px-12 py-5 rounded-2xl bg-cyan-500 text-black font-black uppercase text-sm tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-300">
              Enter the Arena
            </button>
             <button class="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-sm tracking-[0.2em] hover:bg-white/10 transition-all">
              Discover Lore
            </button>
          </div>
        </div>
      </header>

      <div class="w-full px-6 md:px-12 py-32 space-y-48">
        
        <!-- FEATURED GAMES -->
        <section class="max-w-7xl mx-auto space-y-16">
          <div class="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div class="space-y-4">
              <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tighter gaming-font italic leading-none">
                Battle <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">Grounds</span>
              </h2>
              <p class="text-gray-500 font-medium italic">Select your platform and start your journey to the top.</p>
            </div>
            <a routerLink="/app/competitions" class="text-[10px] font-black text-cyan-400 hover:text-white uppercase tracking-[0.4em] transition-colors flex items-center gap-3">
              Browse All Titles <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            @for (title of store.titles(); track title.id) {
              <div [routerLink]="['/app/titles', title.id]" 
                   class="group relative aspect-[4/5] rounded-[3rem] overflow-hidden cursor-pointer bg-[#0a0a0f] border border-white/5 shadow-2xl">
                <img [src]="title.image" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-100" [alt]="title.name">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                
                <div class="absolute bottom-0 left-0 w-full p-10 space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p class="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">{{ title.publisher }}</p>
                  <h3 class="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{{ title.name }}</h3>
                  <div class="pt-4 flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">
                    View Competition <i class="fa-solid fa-chevron-right text-[8px]"></i>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- LIVE EVENTS -->
        <section class="max-w-7xl mx-auto space-y-16">
           <div class="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div class="space-y-4">
              <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tighter gaming-font italic leading-none">
                Live <span class="text-fuchsia-500">Conflicts</span>
              </h2>
              <p class="text-gray-500 font-medium italic">Active engagements currently underway. Witness the execution.</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (comp of store.activeCompetitions(); track comp.id) {
              <div class="card-soft p-2 rounded-[2.5rem] hover:border-fuchsia-500/30 transition-all group relative overflow-hidden bg-black/40 shadow-2xl">
                <div class="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-[60px] pointer-events-none"></div>
                
                <div class="relative h-64 rounded-[2rem] overflow-hidden mb-6">
                  <div class="absolute top-6 right-6 px-4 py-1.5 bg-red-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest backdrop-blur-xl z-10 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse">Live Now</div>
                  <img [src]="comp.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100">
                </div>
                
                <div class="p-6 space-y-6">
                  <h3 class="text-3xl font-black text-white uppercase tracking-tighter italic">{{ comp.name }}</h3>
                  <div class="flex justify-between items-center bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                    <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Prize Pool</span>
                    <span class="text-xl font-black text-fuchsia-400 font-mono">{{ comp.prizePool }}</span>
                  </div>
                  <button [routerLink]="['/app/competitions', comp.id]" class="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-fuchsia-600 hover:text-white text-gray-400 font-black uppercase text-xs tracking-widest transition-all shadow-xl group-hover:border-fuchsia-500/30">
                    Join Combat
                  </button>
                </div>
              </div>
            } @empty {
              <div class="col-span-full py-32 text-center card-soft border-dashed border-2 border-white/5 opacity-30 rounded-[3rem]">
                <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-xs italic">All fronts currently silent. Stand by for upcoming deployments.</p>
              </div>
            }
          </div>
        </section>

        <!-- GLOBAL PARTNERS -->
        <section class="max-w-7xl mx-auto space-y-16 pb-32">
          <div class="flex flex-col items-center gap-4">
            <span class="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] italic">Strategic Alliance</span>
            <div class="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
          
          <div class="flex justify-center gap-12 md:gap-20 flex-wrap opacity-30 hover:opacity-100 transition-all duration-700 px-4">
             @for (s of store.sponsors(); track s.id) {
               <a [href]="s.siteUrl" target="_blank" class="h-12 md:h-16 group">
                 <img [src]="s.logo" class="h-full object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110" [alt]="s.name">
               </a>
             }
             @if (store.sponsors().length === 0) {
               <div class="flex gap-16 grayscale font-mono font-black text-xl md:text-3xl text-gray-700 tracking-tighter italic">
                 <span>LOGITECH G</span>
                 <span>RAZER</span>
                 <span>INTEL</span>
                 <span>DISCORD</span>
               </div>
             }
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    @keyframes slow-zoom {
      from { transform: scale(1); }
      to { transform: scale(1.1); }
    }
    .animate-slow-zoom { animation: slow-zoom 20s infinite alternate ease-in-out; }
  `]
})
export class HomeComponent {
  store = inject(StoreService);
}
