import { Component, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-title-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (title(); as t) {
      <div class="min-h-screen pb-20">
         
         <!-- Hero -->
         <div class="relative w-full h-[60vh] flex items-end">
            <img [src]="t.image" class="w-full h-full object-cover" alt="Title Cover">
            <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
            
            <div class="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
               <span class="px-3 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-widest mb-4 inline-block">{{ t.publisher }}</span>
               <h1 class="text-7xl md:text-9xl gaming-font text-white leading-none mb-4">{{ t.name }}</h1>
               <p class="text-xl text-gray-300 max-w-2xl font-light mb-6">{{ t.description }}</p>
               
               @if (t.downloadLinks && t.downloadLinks.length > 0) {
                  <div class="flex flex-wrap gap-3">
                     @for (link of t.downloadLinks; track link.platform) {
                        <a [href]="link.url" target="_blank" class="px-6 py-3 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:scale-105 transition-transform text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                           Download for {{ link.platform }}
                        </a>
                     }
                  </div>
               }
            </div>
         </div>

         <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            <!-- Competitions List -->
            <div class="lg:col-span-3">
               <h2 class="text-3xl gaming-font text-white mb-8">ACTIVE TOURNAMENTS</h2>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  @for (comp of competitions(); track comp.id) {
                     <div class="glass-panel p-1 rounded-2xl hover:border-cyan-500/50 transition-all group">
                        <div class="bg-black/40 rounded-xl overflow-hidden h-full">
                           <div class="relative h-40">
                              <img [src]="comp.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                              <div class="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] font-bold uppercase text-white backdrop-blur-sm">{{ comp.status }}</div>
                           </div>
                           <div class="p-5">
                              <h3 class="text-2xl gaming-font text-white mb-1">{{ comp.name }}</h3>
                              <p class="text-gray-500 text-sm mb-4">Prize: <span class="text-cyan-400">{{ comp.prizePool }}</span></p>
                              <a [routerLink]="['/app/competitions', comp.id]" class="block w-full text-center py-2 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                 View Bracket
                              </a>
                           </div>
                        </div>
                     </div>
                  }
                  @if (competitions().length === 0) {
                     <div class="text-gray-500">No active competitions for this title.</div>
                  }
               </div>
            </div>

            <!-- Leaderboard -->
            <div class="lg:col-span-1">
               <div class="glass-panel p-6 rounded-2xl sticky top-24">
                  <h3 class="text-xl gaming-font text-white mb-6 border-b border-white/10 pb-4">SEASON RANKING</h3>
                  <div class="space-y-3">
                     @for (team of store.teams().slice(0, 5); track team.id; let i = $index) {
                        <div class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                           <span class="text-lg font-mono font-bold w-6 text-gray-500">#{{i+1}}</span>
                           <div class="flex-grow font-bold text-white text-sm truncate">{{ team.name }}</div>
                           <div class="text-xs text-cyan-400 font-mono">{{ 2000 - (i*50) }}</div>
                        </div>
                     }
                  </div>
                  <button class="w-full mt-6 py-2 text-xs text-gray-500 hover:text-white uppercase font-bold tracking-widest transition-colors">View Full Standings</button>
               </div>
            </div>

         </div>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center text-gray-500">Title not found</div>
    }
  `
})
export class TitleDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  titleId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  title = computed(() => this.store.getTitleById(this.titleId())());
  competitions = computed(() => this.store.getCompetitionsByTitle(this.titleId())());
}