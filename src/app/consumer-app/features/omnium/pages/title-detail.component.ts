import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-title-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (title(); as t) {
      <div class="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans pb-32 animate-soft-in">
         
         <!-- CINEMATIC HERO -->
         <div class="relative w-full h-[65vh] flex items-end">
            <img [src]="t.image" class="absolute inset-0 w-full h-full object-cover animate-slow-zoom opacity-60" alt="Title Cover">
            <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
            
            <div class="relative z-20 w-full max-w-7xl mx-auto px-6 pb-20 space-y-8 text-left">
               <div class="flex items-center gap-4">
                  <div class="h-px w-12 bg-cyan-500/50"></div>
                  <span class="text-cyan-400 font-black text-xs tracking-[0.5em] uppercase">{{ t.publisher }}</span>
               </div>
               <h1 class="text-7xl md:text-[10rem] font-black gaming-font text-white leading-none tracking-tighter uppercase italic">{{ t.name }}</h1>
               <p class="text-xl md:text-2xl text-gray-300 max-w-3xl font-medium italic leading-relaxed">{{ t.description }}</p>
               
               @if (t.downloadLinks && t.downloadLinks.length > 0) {
                  <div class="flex flex-wrap gap-6 pt-4">
                     @for (link of t.downloadLinks; track link.platform) {
                        <a [href]="link.url" target="_blank" class="px-10 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                           Deploy on {{ link.platform }}
                        </a>
                     }
                  </div>
               }
            </div>
         </div>

         <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-16 mt-16 text-left font-black italic">
            
            <!-- COMPETITIONS -->
            <div class="lg:col-span-3 space-y-12">
               <h2 class="text-4xl font-black text-white uppercase tracking-tighter gaming-font italic border-l-8 border-cyan-500 pl-8 leading-none">Strategic <span class="text-cyan-400">Arenas</span></h2>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  @for (comp of competitions(); track comp.id) {
                     <div class="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-[#0a0a0f] border border-white/5 shadow-2xl hover:border-cyan-500/30 transition-all duration-500">
                        <img [src]="comp.image" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60">
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        
                        <div class="absolute top-6 right-6">
                           <div class="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl flex items-center gap-2">
                              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                              <span class="text-[9px] font-black uppercase tracking-widest text-white">{{ comp.status }}</span>
                           </div>
                        </div>

                        <div class="absolute bottom-0 left-0 w-full p-8 space-y-4">
                           <h3 class="text-3xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-cyan-400 transition-colors">{{ comp.name }}</h3>
                           <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                              <span>Prize Pool</span>
                              <span class="text-white font-mono text-base">{{ comp.prizePool }}</span>
                           </div>
                           <button [routerLink]="['/app/competitions', comp.id]" class="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">
                              View Intel
                           </button>
                        </div>
                     </div>
                  }
                  @if (competitions().length === 0) {
                     <div class="col-span-full py-20 text-center card-soft border-dashed border-2 border-white/5 opacity-30 rounded-[2.5rem]">
                        <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-sm">No tactical deployments found for this title.</p>
                     </div>
                  }
               </div>
            </div>

            <!-- SIDEBAR STATS -->
            <div class="lg:col-span-1">
               <div class="bg-[#0a0a0f] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl sticky top-24 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] pointer-events-none"></div>
                  <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-cyan-500 pl-6 leading-none">Hall of Fame</h3>
                  <div class="space-y-6">
                     @for (team of store.teams().slice(0, 5); track team.id; let i = $index) {
                        <div class="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                           <span class="text-xl font-mono font-black text-gray-700 italic group-hover:text-cyan-400 transition-colors w-8">#{{i+1}}</span>
                           <div class="flex-grow font-black text-white uppercase tracking-tighter text-sm truncate">{{ team.name }}</div>
                           <div class="text-xs font-black text-cyan-400 font-mono drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{{ 2000 - (i*50) }}</div>
                        </div>
                     }
                  </div>
                  <button class="w-full mt-10 py-4 bg-white/5 border border-white/10 text-gray-500 hover:text-white rounded-xl font-black uppercase text-[9px] tracking-[0.3em] transition-all">Full Archives</button>
               </div>
            </div>

         </div>
      </div>
    } @else {
      <div class="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10 text-center">
         <i class="fa-solid fa-ghost text-6xl text-gray-800 mb-8 animate-bounce"></i>
         <h1 class="text-4xl font-black text-gray-700 uppercase tracking-widest gaming-font">Title Not Initialized</h1>
         <a routerLink="/app" class="mt-8 text-cyan-400 font-black uppercase text-xs tracking-[0.4em] hover:text-white transition-colors">Return to Base</a>
      </div>
    }
  `,
  styles: [`
    @keyframes slow-zoom {
      from { transform: scale(1); }
      to { transform: scale(1.1); }
    }
    .animate-slow-zoom { animation: slow-zoom 20s infinite alternate ease-in-out; }
  `]
})
export class TitleDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  titleId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  title = computed(() => this.store.getTitleById(this.titleId())());
  competitions = computed(() => this.store.getCompetitionsByTitle(this.titleId())());
}
