import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#050505] p-6 md:p-12 space-y-16 animate-soft-in">
      
      <!-- HERO HEADER -->
      <header class="max-w-7xl mx-auto space-y-6 pt-10 text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-3">
          <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse"></span>
          <span class="text-cyan-400 font-black text-xs tracking-[0.4em] uppercase">Intelligence Feed</span>
        </div>
        <h1 class="text-6xl md:text-9xl font-black gaming-font leading-none uppercase tracking-tighter italic text-white">
          LATEST <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">INTEL</span>
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl font-medium italic mx-auto md:mx-0">
          Field reports, tactical updates, and community highlights from the front lines of the OMNIUM arena.
        </p>
      </header>

      <!-- NEWS GRID -->
      <section class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
        @for (item of store.news(); track item.id) {
          <div class="group bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all duration-500 shadow-2xl flex flex-col">
            
            <!-- Hero Image -->
            <div class="relative h-64 overflow-hidden shrink-0">
              <img [src]="item.image" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100" [alt]="item.title">
              <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent"></div>
              
              <!-- Date Badge -->
              <div class="absolute top-6 left-6">
                <div class="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-cyan-400 font-mono tracking-widest uppercase shadow-lg">
                  {{ item.date }}
                </div>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-10 flex flex-col flex-grow space-y-6">
              <h2 class="text-3xl font-black text-white uppercase tracking-tighter leading-tight italic group-hover:text-cyan-400 transition-colors">
                {{ item.title }}
              </h2>
              <p class="text-gray-500 text-base font-medium italic leading-relaxed flex-grow">
                {{ item.excerpt }}
              </p>
              
              <button class="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-xl">
                Access Full Report
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-40 text-center card-soft border-dashed border-2 border-white/5 opacity-30 rounded-[3rem]">
            <i class="fa-solid fa-satellite-dish text-5xl mb-6 text-gray-700"></i>
            <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-sm italic">Signal lost. No field reports currently available.</p>
          </div>
        }
      </section>

    </div>
  `
})
export class NewsComponent {
  store = inject(StoreService);
}
