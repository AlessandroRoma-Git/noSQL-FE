import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (team(); as t) {
      <div class="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans pb-32 animate-soft-in">
        
        <!-- HERO HEADER -->
        <div class="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
           <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071" 
                class="w-full h-full object-cover scale-105 opacity-30" alt="Team Header">
           <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
           
           <div class="absolute bottom-0 left-0 w-full p-6 md:p-16 z-20 text-left">
              <div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-end justify-between gap-10">
                <div class="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
                   <div class="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-[#0a0a0f] border-4 border-black/50 shadow-2xl p-4 flex items-center justify-center relative group">
                      <img [src]="t.logo" class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" alt="Logo">
                      <div class="absolute -inset-2 border-2 border-fuchsia-500/20 rounded-[3rem] -z-10 animate-pulse"></div>
                   </div>
                   
                   <div class="space-y-4">
                      <div class="flex items-center justify-center md:justify-start gap-3">
                         <span class="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_10px_#d946ef] animate-pulse"></span>
                         <span class="text-fuchsia-500 font-black text-[10px] tracking-[0.3em] uppercase">Organization Identity</span>
                      </div>
                      <h1 class="text-6xl md:text-9xl font-black gaming-font leading-none uppercase tracking-tighter italic text-white">{{ t.name }}</h1>
                      <p class="text-gray-400 text-lg max-w-2xl font-medium italic leading-relaxed">
                         {{ t.description || 'This organization has not yet initialized its public manifesto.' }}
                      </p>
                   </div>
                </div>

                <div class="flex flex-col gap-4 w-full md:w-auto">
                   <button class="w-full md:px-16 h-16 rounded-[1.5rem] bg-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                      Declare Conflict
                   </button>
                   
                   @if (canJoin()) {
                      @if (hasPending()) {
                          <button disabled class="w-full md:px-12 h-16 rounded-[1.5rem] bg-yellow-500/10 text-yellow-500 font-black uppercase text-xs tracking-widest border border-yellow-500/20 opacity-80 cursor-not-allowed">
                              Request Pending
                          </button>
                      } @else {
                          <button (click)="requestJoin()" [disabled]="isRequesting()" class="w-full md:px-12 h-16 rounded-[1.5rem] bg-white/5 text-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all border border-white/10 disabled:opacity-50">
                             {{ isRequesting() ? 'Processing...' : 'Request Entry' }}
                          </button>
                      }
                   }
                </div>
              </div>
           </div>
        </div>

        <div class="max-w-screen-2xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 text-left italic">
           
           <!-- PERFORMANCE METRICS -->
           <div class="lg:col-span-1 space-y-10">
              <div class="bg-[#0a0a0f] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-[60px] pointer-events-none"></div>
                 <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-fuchsia-500 pl-6 leading-none text-left">Squad Metrics</h3>
                 <div class="space-y-6">
                    <div class="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-fuchsia-500/30 transition-all">
                       <span class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Foundation Year</span>
                       <span class="text-3xl font-black font-mono text-white italic text-right">{{ t.founded }}</span>
                    </div>
                    <div class="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-green-500/30 transition-all text-left">
                       <span class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Efficiency (WR)</span>
                       <span class="text-3xl font-black font-mono text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)] italic text-right">
                          {{ (t.wins / ((t.wins + t.losses) || 1) * 100) | number:'1.0-0' }}%
                       </span>
                    </div>
                    <div class="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                       <span class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Combat Record</span>
                       <span class="text-3xl font-black font-mono text-white italic text-right">{{ t.wins }}W - {{ t.losses }}L</span>
                    </div>
                 </div>
              </div>

              <!-- RECENT ENGAGEMENTS -->
              <div class="bg-[#0a0a0f] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl text-left">
                 <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-cyan-500 pl-6 leading-none">Activity Log</h3>
                 <div class="space-y-4">
                    @for (match of teamMatches(); track match.id) {
                       <div class="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all text-left">
                          <div class="flex flex-col gap-1">
                             <div class="flex items-center gap-3">
                                <span [class.text-cyan-400]="match.teamA === t.name" class="font-black uppercase text-sm tracking-tighter italic">{{ match.teamA }}</span>
                                <span class="text-[10px] text-gray-600 font-black italic">VS</span>
                                <span [class.text-cyan-400]="match.teamB === t.name" class="font-black uppercase text-sm tracking-tighter italic">{{ match.teamB }}</span>
                             </div>
                             <span class="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] italic">{{ match.round }}</span>
                          </div>
                          
                          @if (match.status === 'completed') {
                             <span class="text-xl font-black font-mono text-white italic">{{ match.scoreA }} : {{ match.scoreB }}</span>
                          } @else {
                             <span class="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest rounded-lg">LIVE</span>
                          }
                       </div>
                    } @empty {
                       <div class="py-10 text-center opacity-30 italic">No engagements recorded.</div>
                    }
                 </div>
              </div>
           </div>

           <!-- ACTIVE PERSONNEL (ROSTER) -->
           <div class="lg:col-span-2 space-y-10 text-left">
              <h2 class="text-4xl font-black text-white uppercase tracking-tighter gaming-font italic leading-none border-l-8 border-cyan-500 pl-8 font-black uppercase italic">Active <span class="text-cyan-400">Personnel</span></h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 @for (member of t.members; track member) {
                    <div [routerLink]="['/app/profile', member]" 
                         class="group p-8 bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] flex items-center gap-8 hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all duration-500 cursor-pointer shadow-xl text-left">
                       <div class="relative">
                          <img [src]="'https://ui-avatars.com/api/?name=' + member + '&background=random'" 
                               class="w-20 h-20 rounded-[1.5rem] bg-gray-800 object-cover transition-transform duration-700 group-hover:scale-110 shadow-lg">
                          <div class="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-[#0a0a0f] rounded-full"></div>
                       </div>
                       <div class="space-y-1 text-left">
                          <div class="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-cyan-400 transition-colors italic leading-none">{{ member }}</div>
                          <div class="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] italic">Combat Operative</div>
                       </div>
                       <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <i class="fa-solid fa-chevron-right text-cyan-400 text-xs"></i>
                       </div>
                    </div>
                 }
              </div>
           </div>

        </div>

      </div>
    } @else {
      <div class="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10 text-center italic font-black">
         <i class="fa-solid fa-ghost text-6xl text-gray-800 mb-8 animate-bounce italic font-black"></i>
         <h1 class="text-4xl font-black text-gray-700 uppercase tracking-widest gaming-font italic uppercase font-black">Squad Not Initialized</h1>
         <a routerLink="/app/teams" class="mt-8 text-fuchsia-500 font-black uppercase text-xs tracking-[0.4em] hover:text-white transition-colors italic uppercase font-black">Browse Squad Directory</a>
      </div>
    }
  `
})
export class TeamDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  teamId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  team = computed(() => this.store.getTeamById(this.teamId())());
  teamMatches = computed(() => {
     const t = this.team();
     return t ? this.store.getMatchesByTeam(t.name)() : [];
  });
  
  isRequesting = signal(false);

  hasPending = computed(() => {
     return this.store.hasPendingRequest(this.teamId())();
  });

  canJoin = computed(() => {
      const user = this.store.currentUser();
      const t = this.team();
      return user && user.role === 'player' && !user.teamId && t && !t.members.includes(user.name);
  });

  requestJoin() {
      this.isRequesting.set(true);
      setTimeout(() => {
         this.store.requestJoinTeam(this.teamId());
         this.isRequesting.set(false);
      }, 500);
  }
}
