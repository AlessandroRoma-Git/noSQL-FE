import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService, Match } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { BracketComponent } from '../components/bracket.component';
import { MatchListComponent } from '../components/match-list.component';
import { CalendarComponent } from '../components/calendar.component';
import { LeaderboardComponent } from '../components/leaderboard.component';

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, 
    BracketComponent, MatchListComponent, 
    CalendarComponent, LeaderboardComponent
  ],
  template: `
    @if (competition(); as comp) {
      <div class="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
        
        <!-- HEADER -->
        <div class="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
           <img [src]="comp.image" class="w-full h-full object-cover scale-105" alt="Header">
           <div class="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm z-10"></div>
           <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10"></div>
           
           <div class="absolute bottom-0 left-0 w-full p-6 md:p-16 z-20 text-left">
              <div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-end justify-between gap-10">
                <div class="space-y-6">
                   <div class="flex items-center gap-4">
                     <div class="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span class="text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase">{{ comp.status }}</span>
                     </div>
                     <span class="text-white/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                        {{ comp.format.replace('_', ' ') }}
                     </span>
                   </div>
                   <h1 class="text-6xl md:text-8xl font-black gaming-font leading-none uppercase tracking-tighter text-white italic">
                      {{ comp.name }}
                   </h1>
                </div>
                <div class="flex gap-6">
                    <div class="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 min-w-[160px] shadow-2xl">
                       <div class="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-[0.2em]">Prize Pool</div>
                       <div class="text-3xl font-black text-white font-mono leading-none">{{ comp.prizePool }}</div>
                    </div>
                    <div class="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 min-w-[160px] shadow-2xl">
                       <div class="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-[0.2em]">Rules</div>
                       <div class="text-3xl font-black text-white italic leading-none italic font-black">BO{{ comp.matchRules }}</div>
                    </div>
                </div>
              </div>
           </div>
        </div>

        <div class="w-full">
           <!-- NAVIGATION -->
           <div class="flex justify-center -mt-8 mb-16 relative z-30 px-6">
              <div class="flex bg-[#0a0a0f] p-2 rounded-full border border-white/10 backdrop-blur-2xl shrink-0 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
                <button (click)="activeTab.set('upcoming')" [class]="getTabClass('upcoming')">Matches</button>
                <button (click)="activeTab.set('bracket')" [class]="getTabClass('bracket')">Bracket View</button>
                <button (click)="activeTab.set('leaderboard')" [class]="getTabClass('leaderboard')">Leaderboard</button>
                <button (click)="activeTab.set('calendar')" [class]="getTabClass('calendar')">Timeline</button>
                <button (click)="activeTab.set('results')" [class]="getTabClass('results')">Archive</button>
                <button (click)="activeTab.set('rules')" [class]="getTabClass('rules')">Regulations</button>
              </div>
           </div>

           <!-- VIEWS -->
           <div class="max-w-7xl mx-auto px-6 animate-soft-in">
              
              @if (activeTab() === 'upcoming') {
                 <app-match-list [matches]="upcomingMatches()" [canEdit]="canEdit()" (onEdit)="openEditModal($event)"></app-match-list>
              }

              @if (activeTab() === 'bracket') {
                 <app-bracket [matches]="matches()" [canEdit]="canEdit()" (onEdit)="openEditModal($event)"></app-bracket>
              }

              @if (activeTab() === 'leaderboard') {
                 <app-leaderboard 
                   [matches]="matches()" 
                   [registeredTeamIds]="comp.registeredTeams || []" 
                   [allTeams]="store.teams()">
                 </app-leaderboard>
              }

              @if (activeTab() === 'calendar') {
                 <app-calendar [matches]="matches()" [canEdit]="canEdit()" (onEdit)="openEditModal($event)"></app-calendar>
              }

              @if (activeTab() === 'results') {
                 <app-match-list [matches]="pastMatches()" [canEdit]="canEdit()" [isResult]="true" (onEdit)="openEditModal($event)"></app-match-list>
              }

              @if (activeTab() === 'rules') {
                 <div class="card-soft p-16 border-white/10 shadow-2xl relative text-center bg-[#0a0a0f]/80 rounded-[2.5rem]">
                    <div class="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-right italic font-black text-white">
                       <i class="fa-solid fa-scroll text-[200px] text-white opacity-10"></i>
                    </div>
                    <h2 class="text-5xl font-black text-white mb-16 uppercase tracking-tighter gaming-font border-l-8 border-cyan-500 pl-8 leading-none text-left italic uppercase font-black">Official <span class="text-cyan-400 uppercase italic font-black">Rulebook</span></h2>
                    <div class="space-y-10 relative z-10 text-left font-black italic">
                       @for (rule of comp.rules; track rule.code) {
                           <div class="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-cyan-500/20 transition-all group text-left">
                              <div class="flex items-start gap-8 text-left">
                                 <span class="px-5 py-2 bg-cyan-900/40 text-cyan-400 font-mono font-black rounded-xl text-lg border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all text-left font-mono leading-none italic font-black">{{ rule.code }}</span>
                                 <div class="space-y-4 text-left italic font-black leading-tight">
                                    <h3 class="text-2xl font-black text-white uppercase tracking-tight text-left italic font-black">{{ rule.title }}</h3>
                                    <p class="text-gray-500 text-lg leading-relaxed text-left italic opacity-70">{{ rule.description }}</p>
                                 </div>
                              </div>
                           </div>
                       }
                    </div>
                 </div>
              }
           </div>
        </div>
      </div>

      <!-- EDIT MATCH MODAL -->
      @if (showEditModal()) {
         <div class="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-soft-in text-center italic">
            <div class="card-soft w-full max-w-2xl overflow-hidden border-cyan-500/30 shadow-2xl relative text-center bg-[#0a0a0f] rounded-[2.5rem]">
               <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent italic"></div>
               <div class="bg-white/[0.02] border-b border-white/10 p-10 flex justify-between items-center text-left font-black">
                  <div class="space-y-1 text-left italic">
                     <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font leading-none italic text-left">Match <span class="text-cyan-400 uppercase italic">Override</span></h3>
                     <p class="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] text-left italic">Direct NoSQL Record Manipulation</p>
                  </div>
                  <button (click)="showEditModal.set(false)" class="w-12 h-12 rounded-full bg-white/5 text-gray-500 hover:text-white transition-all flex items-center justify-center border border-white/5 text-center italic font-black"><i class="fa-solid fa-xmark text-xl italic font-black"></i></button>
               </div>
               
               <div class="p-10 space-y-12 bg-[#0a0a0f] text-left italic font-black">
                  <div class="grid grid-cols-2 gap-12 text-left italic font-black">
                     <div class="space-y-6 text-center italic font-black font-black">
                        <label class="label text-[10px] uppercase font-black tracking-[0.3em] text-gray-600 italic font-black">Primary Squad</label>
                        <input type="text" [(ngModel)]="editMatchData.teamA" class="input h-16 text-xl font-black !rounded-2xl border-white/10 text-center uppercase focus:border-cyan-500 italic">
                        <input type="number" [(ngModel)]="editMatchData.scoreA" class="input h-24 font-mono text-6xl text-center text-cyan-400 !rounded-[2.5rem] bg-white/[0.03] border-none shadow-2xl italic font-black">
                     </div>
                     <div class="space-y-6 text-center italic font-black">
                        <label class="label text-[10px] uppercase font-black tracking-[0.3em] text-gray-600 italic font-black">Opponent Squad</label>
                        <input type="text" [(ngModel)]="editMatchData.teamB" class="input h-16 text-xl font-black !rounded-2xl border-white/10 text-center uppercase focus:border-cyan-500 italic">
                        <input type="number" [(ngModel)]="editMatchData.scoreB" class="input h-24 font-mono text-6xl text-center text-cyan-400 !rounded-[2.5rem] bg-white/[0.03] border-none shadow-2xl italic font-black">
                     </div>
                  </div>

                  <div class="grid grid-cols-2 gap-8 pt-10 border-t border-white/5 text-left italic font-black">
                     <div class="space-y-4 italic font-black">
                        <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic">Classification</label>
                        <input type="text" [(ngModel)]="editMatchData.round" class="input h-14 text-sm font-black uppercase !rounded-xl italic">
                     </div>
                     <div class="space-y-4 italic font-black">
                        <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic">Status</label>
                        <select [(ngModel)]="editMatchData.status" class="input h-14 text-sm font-black uppercase appearance-none !rounded-xl italic font-black">
                           <option value="scheduled">Scheduled</option>
                           <option value="live">Live Action</option>
                           <option value="completed">Finished</option>
                           <option value="disputed">Sync Issue</option>
                        </select>
                     </div>
                  </div>

                  <div class="italic font-black">
                     <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 mb-4 block italic font-black">Deployment Time</label>
                     <input type="datetime-local" [(ngModel)]="editMatchData.date" class="input h-14 font-mono text-base !rounded-xl shadow-inner border-white/5 italic">
                  </div>
               </div>

               <div class="bg-black/80 border-t border-white/10 p-10 flex justify-end gap-6 text-left italic font-black">
                  <button (click)="showEditModal.set(false)" class="px-10 h-14 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.2em] italic font-black">Cancel</button>
                  <button (click)="saveMatch()" class="button-primary px-16 h-14 !bg-cyan-500 !text-black text-[11px] font-black uppercase shadow-2xl !rounded-2xl tracking-[0.3em] italic font-black">Sync Data</button>
               </div>
            </div>
         </div>
      }

    } @else {
       <div class="min-h-screen flex flex-col items-center justify-center p-10 bg-[#050505] animate-soft-in">
          <div class="w-32 h-32 rounded-[3rem] bg-white/5 flex items-center justify-center text-5xl text-gray-800 mb-12 border border-white/10 shadow-inner">
             <i class="fa-solid fa-ghost italic font-black"></i>
          </div>
          <h1 class="text-5xl font-black text-gray-700 uppercase tracking-tighter gaming-font mb-10 leading-none italic uppercase">Instance Not Found</h1>
          <a routerLink="/app/competitions" class="button-primary px-16 h-16 flex items-center justify-center font-black uppercase tracking-widest text-sm !rounded-full shadow-2xl font-black">Return to Hub</a>
       </div>
    }
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .custom-scrollbar::-webkit-scrollbar { height: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.4); }
  `]
})
export class CompetitionDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  competitionId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  competition = computed(() => this.store.competitions().find(c => c.id === this.competitionId()));
  activeTab = signal<'upcoming' | 'bracket' | 'leaderboard' | 'calendar' | 'results' | 'rules'>('upcoming');
  
  showEditModal = signal(false);
  editMatchId = '';
  editMatchData: any = { teamA: '', teamB: '', scoreA: 0, scoreB: 0, status: 'scheduled', round: '', date: '' };

  canEdit = computed(() => {
     const user = this.store.currentUser();
     if (!user) return false;
     return (user.role as string) === 'admin' || (user.role as string) === 'super_admin';
  });

  constructor() {
      this.route.queryParams.subscribe(params => {
          if (params['tab']) this.activeTab.set(params['tab']);
      });
  }
  
  currentDate = signal(new Date());

  matches = computed(() => {
     const id = this.competitionId();
     return this.store.matches().filter(m => m.competitionId === id);
  });

  upcomingMatches = computed(() => {
     return this.matches()
        .filter(m => m.status === 'scheduled' || m.status === 'live' || m.status === 'disputed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  pastMatches = computed(() => {
     return this.matches()
        .filter(m => m.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  openEditModal(match: Match) {
     this.editMatchId = match.id;
     this.editMatchData = { ...match, date: match.date ? match.date.substring(0, 16) : '' };
     this.showEditModal.set(true);
  }

  saveMatch() {
     this.store.updateMatch(this.editMatchId, this.editMatchData);
     this.showEditModal.set(false);
  }

  getTabClass(tabName: string) {
     const base = "px-10 py-4 rounded-full text-[11px] font-black transition-all uppercase tracking-[0.25em] whitespace-nowrap ";
     if (this.activeTab() === tabName) {
         if (tabName === 'upcoming' || tabName === 'calendar' || tabName === 'rules') return base + "bg-cyan-500 text-black shadow-[0_0_25px_rgba(34,211,238,0.5)]";
         if (tabName === 'bracket' || tabName === 'leaderboard') return base + "bg-purple-600 text-white shadow-[0_0_25px_rgba(147,51,234,0.5)]";
         return base + "bg-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.5)]";
     }
     return base + "text-gray-500 hover:text-white";
  }
}
