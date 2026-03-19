import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService, Competition } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-competitions',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#050505] p-6 md:p-12 space-y-16 animate-soft-in">
      
      <!-- HERO HEADER -->
      <header class="max-w-7xl mx-auto space-y-6 pt-10 text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-3">
          <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse"></span>
          <span class="text-cyan-400 font-black text-xs tracking-[0.4em] uppercase">Tournament Hub</span>
        </div>
        <h1 class="text-6xl md:text-9xl font-black gaming-font leading-none uppercase tracking-tighter italic text-white">
          ARENA <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">LIVE</span>
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl font-medium italic mx-auto md:mx-0">
          Enter the most competitive tournaments in the ecosystem. Glory and legendary rewards await the winners.
        </p>
      </header>

      <!-- FILTER BAR -->
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between px-4">
        <div class="flex bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-xl shrink-0 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          <button (click)="filter.set('all')" [class]="getFilterClass('all')">All Arenas</button>
          <button (click)="filter.set('active')" [class]="getFilterClass('active')">Live Now</button>
          <button (click)="filter.set('upcoming')" [class]="getFilterClass('upcoming')">Upcoming</button>
          <button (click)="filter.set('completed')" [class]="getFilterClass('completed')">Hall of Fame</button>
        </div>
        
        <div class="relative w-full md:w-96 group">
          <i class="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"></i>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search competitions..." 
                 class="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600 italic shadow-inner">
        </div>
      </div>

      <!-- COMPETITIONS GRID -->
      <section class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
        @for (comp of filteredCompetitions(); track comp.id) {
          <a [routerLink]="['/app/competitions', comp.id]" 
             class="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#0a0a0f] border border-white/5 shadow-2xl hover:border-cyan-500/30 transition-all duration-500">
            
            <!-- Hero Image -->
            <img [src]="comp.image" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" [alt]="comp.name">
            
            <!-- Overlays -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div class="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors duration-500"></div>
            
            <!-- Status Badge -->
            <div class="absolute top-8 left-8">
              <div class="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full" [class]="getStatusColor(comp.status)"></span>
                <span class="text-[9px] font-black uppercase tracking-widest text-white">{{ comp.status }}</span>
              </div>
            </div>

            <!-- Content -->
            <div class="absolute bottom-0 left-0 w-full p-10 space-y-6">
              <div class="space-y-2">
                <div class="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em]">{{ comp.format.replace('_', ' ') }}</div>
                <h3 class="text-4xl font-black text-white uppercase tracking-tighter leading-none italic group-hover:text-cyan-400 transition-colors">{{ comp.name }}</h3>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                  <div class="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Prize Pool</div>
                  <div class="text-lg font-black text-white font-mono leading-none">{{ comp.prizePool }}</div>
                </div>
                <div class="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                  <div class="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Start Date</div>
                  <div class="text-lg font-black text-white font-mono leading-none italic">{{ comp.startDate | date:'MMM dd' }}</div>
                </div>
              </div>

              <!-- CTA Button (Visible on Hover) -->
              <div class="pt-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <div class="w-full py-4 bg-cyan-500 text-black rounded-2xl text-center font-black uppercase text-xs tracking-widest shadow-[0_0_30px_#22d3ee]">
                  Enter Arena
                </div>
              </div>
            </div>
          </a>
        } @empty {
          <div class="col-span-full py-40 text-center card-soft border-dashed border-2 border-white/5 opacity-30 rounded-[3rem]">
            <i class="fa-solid fa-ghost text-5xl mb-6 text-gray-700"></i>
            <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-sm italic">No active arenas match your search parameters.</p>
          </div>
        }
      </section>

    </div>
  `
})
export class CompetitionsComponent {
  store = inject(StoreService);
  filter = signal<'all' | 'active' | 'upcoming' | 'completed'>('all');
  searchQuery = '';

  filteredCompetitions = computed(() => {
    let list = this.store.competitions();
    if (this.filter() !== 'all') {
      list = list.filter(c => c.status === this.filter());
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return list;
  });

  getFilterClass(f: string) {
    const base = "px-8 py-3 rounded-full text-[10px] font-black transition-all uppercase tracking-[0.2em] whitespace-nowrap ";
    return this.filter() === f 
      ? base + "bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]" 
      : base + "text-gray-500 hover:text-white";
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-500 shadow-[0_0_10px_green]';
      case 'upcoming': return 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]';
      default: return 'bg-gray-500';
    }
  }
}
