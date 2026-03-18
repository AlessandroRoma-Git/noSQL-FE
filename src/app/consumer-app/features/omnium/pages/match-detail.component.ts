import { Component, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (match(); as m) {
      <div class="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto">
         
         <!-- Match Header -->
         <div class="flex flex-col items-center justify-center mb-10">
            <div class="text-sm text-gray-500 font-mono mb-4 uppercase tracking-widest">{{ m.date }} • {{ m.status }}</div>
            <div class="flex items-center gap-8 md:gap-16">
               <div class="text-center">
                  <h2 class="text-3xl md:text-5xl gaming-font text-white mb-2">{{ m.teamA }}</h2>
                  <div class="text-4xl md:text-6xl font-mono font-bold" [class.text-cyan-400]="m.scoreA > m.scoreB" [class.text-gray-600]="m.scoreA <= m.scoreB">{{ m.scoreA }}</div>
               </div>
               
               <div class="text-2xl font-bold text-gray-700">VS</div>
               
               <div class="text-center">
                  <h2 class="text-3xl md:text-5xl gaming-font text-white mb-2">{{ m.teamB }}</h2>
                  <div class="text-4xl md:text-6xl font-mono font-bold" [class.text-cyan-400]="m.scoreB > m.scoreA" [class.text-gray-600]="m.scoreB <= m.scoreA">{{ m.scoreB }}</div>
               </div>
            </div>
         </div>

         <!-- Stream / Content Area -->
         <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            
            <!-- Main Stream (Simulated) -->
            <div class="lg:col-span-3 bg-black rounded-3xl overflow-hidden border border-gray-800 relative group">
               <div class="absolute inset-0 flex items-center justify-center bg-neutral-900">
                  <div class="text-center">
                     <div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p class="text-gray-500 font-mono text-sm">WAITING FOR STREAM SIGNAL...</p>
                  </div>
               </div>
               <!-- Overlay controls mock -->
               <div class="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="flex justify-between items-center text-white">
                     <span class="font-bold text-red-500 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE</span>
                     <span class="font-mono text-sm">1080p 60FPS</span>
                  </div>
               </div>
            </div>

            <!-- Chat / Info Sidebar -->
            <div class="lg:col-span-1 flex flex-col gap-4 h-full">
               
               <!-- Caster Info -->
               <div class="glass-panel p-4 rounded-2xl shrink-0">
                  <h3 class="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Caster</h3>
                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-gray-700"></div>
                     <div>
                        <div class="text-white font-bold text-sm">{{ m.casterId ? 'CasterVibe' : 'TBD' }}</div>
                        <div class="text-xs text-cyan-400">@OmniumTV</div>
                     </div>
                  </div>
               </div>

               <!-- Chat Mock -->
               <div class="glass-panel rounded-2xl flex-grow flex flex-col overflow-hidden">
                  <div class="p-4 border-b border-white/5 text-xs text-gray-500 font-bold uppercase tracking-widest">Live Chat</div>
                  <div class="flex-grow overflow-y-auto p-4 space-y-3">
                     <div class="text-xs"><span class="font-bold text-fuchsia-400">User88:</span> GG WP!</div>
                     <div class="text-xs"><span class="font-bold text-cyan-400">ProFan:</span> That flick was insane</div>
                     <div class="text-xs"><span class="font-bold text-gray-300">ModBot:</span> Please follow chat rules.</div>
                     <div class="text-xs"><span class="font-bold text-white">ViperFan:</span> Lets go Neon Strikers!</div>
                  </div>
                  <div class="p-3 bg-white/5 border-t border-white/5">
                     <input type="text" placeholder="Send a message..." class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50">
                  </div>
               </div>

            </div>
         </div>

      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center text-gray-500">Match not found</div>
    }
  `
})
export class MatchDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  matchId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  match = computed(() => this.store.getMatchById(this.matchId())());
}