import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-competitions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen pt-10 px-6 max-w-6xl mx-auto pb-20">
      <div class="text-center mb-12">
        <h1 class="text-6xl md:text-8xl gaming-font text-white mb-4">TORNEI</h1>
        <p class="text-gray-400 max-w-xl mx-auto">Scegli la tua arena. Dimostra il tuo valore. Vinci premi esclusivi.</p>
      </div>

      <!-- Filters -->
      <div class="flex justify-center mb-12">
         <div class="flex bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
            <button 
               (click)="filter.set('all')" 
               [ngClass]="filter() === 'all' ? 'bg-white text-black hover:text-black' : 'text-gray-400 hover:text-white'"
               class="px-6 py-2 rounded-full text-sm font-bold transition-all">
               TUTTI
            </button>
            <button 
               (click)="filter.set('active')"
               [ngClass]="filter() === 'active' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'text-gray-400 hover:text-white'"
               class="px-6 py-2 rounded-full text-sm font-bold transition-all">
               LIVE
            </button>
            <button 
               (click)="filter.set('upcoming')"
               [ngClass]="filter() === 'upcoming' ? 'bg-cyan-500 text-black hover:text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'text-gray-400 hover:text-white'"
               class="px-6 py-2 rounded-full text-sm font-bold transition-all">
               IN ARRIVO
            </button>
            <button 
               (click)="filter.set('completed')"
               [ngClass]="filter() === 'completed' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'"
               class="px-6 py-2 rounded-full text-sm font-bold transition-all">
               CONCLUSI
            </button>
         </div>
      </div>

      <div class="flex flex-col gap-8">
        @for (comp of filteredCompetitions(); track comp.id) {
          <div class="glass-panel p-1 rounded-3xl group transition-all duration-300 hover:border-white/20">
            <div class="bg-black/40 rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
              
              <!-- Image -->
              <div class="w-full md:w-64 h-40 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-2xl">
                 <img [src]="comp.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                 <div class="absolute inset-0 bg-black/20"></div>
              </div>
              
              <!-- Info -->
              <div class="flex-grow text-center md:text-left">
                 <div class="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2">
                    <h2 class="text-3xl font-bold text-white gaming-font tracking-wide">{{ comp.name }}</h2>
                    <span [class]="'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ' + 
                      (comp.status === 'active' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                       comp.status === 'upcoming' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20')">
                      {{ comp.status }}
                    </span>
                 </div>
                 <p class="text-gray-400 text-sm mb-6 max-w-lg">Competizione ufficiale 5v5. Regole standard. Anti-cheat obbligatorio.</p>
                 
                 <div class="flex items-center justify-center md:justify-start gap-8">
                    <div>
                       <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Prize Pool</div>
                       <div class="text-xl font-mono text-white">{{ comp.prizePool }}</div>
                    </div>
                    <div class="w-px h-8 bg-white/10"></div>
                    <div>
                       <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Slots</div>
                       <div class="text-xl font-mono text-white">16/32</div>
                    </div>
                 </div>
              </div>

              <!-- Action -->
              <div class="flex flex-col items-center gap-3 shrink-0">
                  <a [routerLink]="['/app/competitions', comp.id]" class="flex items-center justify-center w-14 h-14 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all group-hover:scale-110 shadow-lg shadow-cyan-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </a>
                  <div class="flex gap-2">
                      <a [routerLink]="['/app/competitions', comp.id]" [queryParams]="{tab: 'bracket'}" class="px-3 py-1 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/20 rounded text-[10px] font-bold uppercase transition-all">
                          Bracket
                      </a>
                      <a [routerLink]="['/app/competitions', comp.id]" [queryParams]="{tab: 'calendar'}" class="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/20 rounded text-[10px] font-bold uppercase transition-all">
                          Calendar
                      </a>
                  </div>
              </div>

            </div>
          </div>
        }
        @if (filteredCompetitions().length === 0) {
           <div class="text-center py-20 text-gray-500">
              Nessuna competizione trovata con questo filtro.
           </div>
        }
      </div>
    </div>
  `
})
export class CompetitionsComponent {
  store = inject(StoreService);
  filter = signal<'all' | 'active' | 'upcoming' | 'completed'>('all');

  filteredCompetitions = computed(() => {
    const f = this.filter();
    // Strictly exclude drafts for public view
    if (f === 'all') return this.store.competitions().filter(c => c.status !== 'draft');
    return this.store.competitions().filter(c => c.status === f);
  });
}