import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (competition(); as comp) {
      <div class="min-h-screen">
        
        <!-- Modern Header -->
        <div class="relative w-full h-[50vh]">
           <img [src]="comp.image" class="w-full h-full object-cover" alt="Comp Header">
           <div class="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm"></div>
           <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
           
           <div class="absolute bottom-0 left-0 w-full p-6 md:p-12">
              <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
                <div>
                   <div class="flex items-center gap-3 mb-4">
                     <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                     <span class="text-cyan-400 font-mono text-sm tracking-widest uppercase">{{ comp.status }}</span>
                     <span class="text-gray-500 text-xs uppercase px-2 py-1 bg-white/5 rounded border border-white/5">{{ comp.format.replace('_', ' ') }}</span>
                   </div>
                   <h1 class="text-6xl md:text-8xl font-bold gaming-font text-white leading-none">{{ comp.name }}</h1>
                </div>
                <div class="flex gap-4">
                    <div class="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[150px]">
                       <div class="text-xs text-gray-500 uppercase font-bold mb-1">Prize Pool</div>
                       <div class="text-2xl font-mono text-white">{{ comp.prizePool }}</div>
                    </div>
                    <div class="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[150px]">
                       <div class="text-xs text-gray-500 uppercase font-bold mb-1">Rules</div>
                       <div class="text-2xl font-mono text-white uppercase">BO {{ comp.matchRules }}</div>
                    </div>
                </div>
              </div>
           </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-12">
           
           <!-- Tab Switcher -->
           <div class="flex justify-center mb-12">
              <div class="flex bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md shrink-0">
                <button (click)="activeTab.set('upcoming')" [class]="getTabClass('upcoming')">Upcoming</button>
                <button (click)="activeTab.set('bracket')" [class]="getTabClass('bracket')">Bracket</button>
                <button (click)="activeTab.set('calendar')" [class]="getTabClass('calendar')">Calendar</button>
                <button (click)="activeTab.set('results')" [class]="getTabClass('results')">Results</button>
                <button (click)="activeTab.set('rules')" [class]="getTabClass('rules')">Rules</button>
              </div>
           </div>

           <!-- VIEW: UPCOMING LIST -->
           @if (activeTab() === 'upcoming') {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div class="lg:col-span-2 space-y-4">
                    @for (match of upcomingMatches(); track match.id) {
                       <div [routerLink]="['/app/matches', match.id]" class="glass-panel p-5 rounded-xl hover:bg-white/5 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer border-l-4 border-transparent hover:border-cyan-500">
                          <div class="text-center sm:text-left w-32 shrink-0">
                             @if(match.status === 'live') {
                                <div class="inline-flex items-center gap-1 text-red-500 font-bold text-xs uppercase animate-pulse">
                                   <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> LIVE
                                </div>
                             } @else {
                                <div class="text-cyan-400 font-bold text-sm">{{ match.date | date:'MMM d' }}</div>
                                <div class="text-gray-500 text-xs font-mono">{{ match.date | date:'HH:mm' }}</div>
                                <div class="text-[10px] text-gray-600 uppercase mt-1">{{ match.round || 'Match' }}</div>
                             }
                          </div>
                          <div class="flex items-center gap-4 md:gap-8 flex-grow justify-center">
                             <span class="font-bold text-lg text-right w-32 truncate text-white group-hover:text-cyan-400 transition-colors">{{ match.teamA }}</span>
                             <span class="text-xs text-gray-700 bg-white/10 px-2 py-1 rounded font-mono">VS</span>
                             <span class="font-bold text-lg text-left w-32 truncate text-white group-hover:text-cyan-400 transition-colors">{{ match.teamB }}</span>
                          </div>
                          <div class="w-24 text-right shrink-0 hidden sm:block">
                             <span class="text-xs text-gray-500 group-hover:text-white transition-colors">Details &rarr;</span>
                          </div>
                       </div>
                    }
                    @if(upcomingMatches().length === 0) {
                       <div class="p-12 text-center rounded-2xl border border-dashed border-white/10 text-gray-600">
                          <div class="text-4xl mb-2">😴</div>
                          <p>No upcoming matches scheduled.</p>
                       </div>
                    }
                 </div>
                 <!-- Sidebar Info -->
                 <div class="space-y-8">
                     <div class="glass-panel p-6 rounded-2xl">
                         <h3 class="text-xl gaming-font text-white mb-6">INFO</h3>
                         <div class="space-y-4 text-sm text-gray-400">
                             <div class="flex justify-between">
                                 <span>Max Teams</span>
                                 <span class="text-white font-mono">{{ comp.maxTeams }}</span>
                             </div>
                             <div class="flex justify-between">
                                 <span>Team Size</span>
                                 <span class="text-white font-mono">{{ comp.minPlayers }} - {{ comp.maxPlayers }}</span>
                             </div>
                             <div class="flex justify-between">
                                 <span>Start Date</span>
                                 <span class="text-white font-mono">{{ comp.startDate }}</span>
                             </div>
                             <div class="flex justify-between">
                                 <span>End Date</span>
                                 <span class="text-white font-mono">{{ comp.endDate }}</span>
                             </div>
                         </div>
                     </div>
                 </div>
              </div>
           }

           <!-- VIEW: BRACKET -->
           @if (activeTab() === 'bracket') {
              <div class="overflow-x-auto pb-12">
                 @if (comp.format === 'round_robin') {
                     <!-- ROUND ROBIN STANDINGS -->
                     <div class="glass-panel p-6 rounded-2xl mb-8">
                        <h3 class="text-xl font-bold text-white mb-4">Classifica Girone</h3>
                        <table class="w-full text-left text-sm text-gray-400">
                           <thead class="bg-white/5 text-xs uppercase font-bold text-gray-300">
                              <tr>
                                 <th class="px-4 py-3">#</th>
                                 <th class="px-4 py-3">Team</th>
                                 <th class="px-4 py-3 text-center">Played</th>
                                 <th class="px-4 py-3 text-center">W</th>
                                 <th class="px-4 py-3 text-center">L</th>
                                 <th class="px-4 py-3 text-center text-white">Pts</th>
                              </tr>
                           </thead>
                           <tbody class="divide-y divide-white/5">
                              @for (team of standings(); track team.name; let i = $index) {
                                 <tr class="hover:bg-white/5 transition-colors">
                                    <td class="px-4 py-3 font-mono">{{ i + 1 }}</td>
                                    <td class="px-4 py-3 font-bold text-white">{{ team.name }}</td>
                                    <td class="px-4 py-3 text-center">{{ team.played }}</td>
                                    <td class="px-4 py-3 text-center text-green-400">{{ team.w }}</td>
                                    <td class="px-4 py-3 text-center text-red-400">{{ team.l }}</td>
                                    <td class="px-4 py-3 text-center font-bold text-cyan-400 text-lg">{{ team.pts }}</td>
                                 </tr>
                              }
                           </tbody>
                        </table>
                     </div>
                     
                     <!-- ROUND ROBIN MATCHES LIST -->
                     <div class="space-y-6">
                        @for (round of bracketRounds(); track round.name) {
                            <div>
                                <h4 class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2 border-l-2 border-cyan-500">{{ round.name }}</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    @for (match of round.matches; track match.id) {
                                        <div class="bg-black/40 border border-white/10 rounded-lg p-3 flex justify-between items-center">
                                            <div class="text-sm font-bold text-white">{{ match.teamA }}</div>
                                            <div class="flex flex-col items-center px-4">
                                                <div class="text-xs text-gray-500 font-mono">{{ match.date | date:'shortDate' }}</div>
                                                <div class="font-mono font-bold text-cyan-400">{{ match.scoreA }} - {{ match.scoreB }}</div>
                                            </div>
                                            <div class="text-sm font-bold text-white">{{ match.teamB }}</div>
                                        </div>
                                    }
                                </div>
                            </div>
                        }
                     </div>

                 } @else {
                     <!-- ELIMINATION BRACKET -->
                     <div class="min-w-[800px] flex gap-8">
                        @for (round of bracketRounds(); track round.name) {
                            <div class="flex-1 space-y-8 flex flex-col justify-center min-w-[200px]">
                               <h3 class="text-center text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">{{ round.name }}</h3>
                               @for (match of round.matches; track match.id) {
                                  <div class="bg-black/40 border border-white/10 rounded-lg p-3 relative hover:border-cyan-500 transition-colors">
                                     <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm font-bold" [class.text-cyan-400]="match.scoreA > match.scoreB" [class.text-white]="match.scoreA <= match.scoreB">{{ match.teamA }}</span>
                                        <span class="text-xs font-mono text-gray-500">{{ match.scoreA }}</span>
                                     </div>
                                     <div class="flex justify-between items-center">
                                        <span class="text-sm font-bold" [class.text-cyan-400]="match.scoreB > match.scoreA" [class.text-white]="match.scoreB <= match.scoreA">{{ match.teamB }}</span>
                                        <span class="text-xs font-mono text-gray-500">{{ match.scoreB }}</span>
                                     </div>
                                     
                                     <!-- Status Indicator -->
                                     <div class="absolute top-1 right-1">
                                         @if(match.status === 'live') { <span class="w-2 h-2 rounded-full bg-red-500 block animate-pulse"></span> }
                                         @else if(match.status === 'completed') { <span class="w-2 h-2 rounded-full bg-green-500 block"></span> }
                                         @else { <span class="w-2 h-2 rounded-full bg-gray-700 block"></span> }
                                     </div>
                                  </div>
                               }
                            </div>
                        }
                        @if (bracketRounds().length === 0) {
                            <div class="w-full text-center py-12 text-gray-500">
                                Bracket generation pending or no matches scheduled.
                            </div>
                        }
                     </div>
                 }
              </div>
           }

           <!-- VIEW: CALENDAR -->
           @if (activeTab() === 'calendar') {
               <div class="glass-panel p-8 rounded-2xl">
                   <div class="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                       <button (click)="prevMonth()" class="text-gray-400 hover:text-white font-bold text-xl px-4">&larr;</button>
                       <h3 class="text-2xl gaming-font text-white uppercase">{{ calendarData().monthLabel }}</h3>
                       <button (click)="nextMonth()" class="text-gray-400 hover:text-white font-bold text-xl px-4">&rarr;</button>
                   </div>
                   
                   <div class="grid grid-cols-7 gap-4 text-center mb-4">
                       <div class="text-xs text-gray-500 font-bold uppercase">Sun</div>
                       <div class="text-xs text-gray-500 font-bold uppercase">Mon</div>
                       <div class="text-xs text-gray-500 font-bold uppercase">Tue</div>
                       <div class="text-xs text-gray-500 font-bold uppercase">Wed</div>
                       <div class="text-xs text-gray-500 font-bold uppercase">Thu</div>
                       <div class="text-xs text-gray-500 font-bold uppercase">Fri</div>
                       <div class="text-xs text-gray-500 font-bold uppercase">Sat</div>
                   </div>
                   
                   <!-- Dynamic Calendar Grid -->
                   <div class="grid grid-cols-7 gap-4">
                       @for (day of calendarData().days; track $index) {
                           @if (day.day === null) {
                               <div class="h-32 bg-white/5 rounded-lg opacity-30"></div> 
                           } @else {
                               <div class="h-32 bg-black/40 border border-white/5 rounded-lg p-2 relative hover:bg-white/5 transition-colors overflow-y-auto custom-scrollbar">
                                   <span class="text-xs font-mono text-gray-400 absolute top-2 right-2">{{ day.day }}</span>
                                   
                                   @for (m of day.matches; track m.id) {
                                       <div [routerLink]="['/app/matches', m.id]" class="mt-6 p-1 rounded bg-cyan-900/30 border border-cyan-500/20 text-[10px] truncate text-cyan-400 mb-1 cursor-pointer hover:bg-cyan-500 hover:text-black transition-colors">
                                           {{ m.teamA }} vs {{ m.teamB }}
                                       </div>
                                   }
                               </div>
                           }
                       }
                   </div>
               </div>
           }

           <!-- VIEW: RESULTS -->
           @if (activeTab() === 'results') {
              <div class="grid grid-cols-1 gap-4">
                  @for (match of pastMatches(); track match.id) {
                     <div [routerLink]="['/app/matches', match.id]" class="glass-panel p-5 rounded-xl bg-black/40 hover:bg-white/5 transition-colors flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer border-l-4 border-transparent hover:border-fuchsia-500">
                        <div class="text-xs text-gray-600 font-mono w-24 text-center sm:text-left shrink-0">
                           {{ match.date | date:'MMM d' }}
                        </div>
                        <div class="flex items-center gap-4 md:gap-8 flex-grow justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                           <span class="font-bold text-lg text-right w-32 truncate" [class.text-white]="match.scoreA >= match.scoreB" [class.text-gray-500]="match.scoreA < match.scoreB">{{ match.teamA }}</span>
                           <div class="inline-flex items-center justify-center px-4 py-1 bg-white/5 rounded-lg font-mono font-bold text-white border border-white/5 shadow-inner">
                              <span [class.text-fuchsia-400]="match.scoreA > match.scoreB">{{ match.scoreA }}</span>
                              <span class="mx-2 text-gray-600">:</span>
                              <span [class.text-fuchsia-400]="match.scoreB > match.scoreA">{{ match.scoreB }}</span>
                           </div>
                           <span class="font-bold text-lg text-left w-32 truncate" [class.text-white]="match.scoreB >= match.scoreA" [class.text-gray-500]="match.scoreB < match.scoreA">{{ match.teamB }}</span>
                        </div>
                        <div class="w-24 text-right shrink-0">
                           <span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-400">Final</span>
                        </div>
                     </div>
                  }
                  @if(pastMatches().length === 0) {
                     <div class="p-12 text-center rounded-2xl border border-dashed border-white/10 text-gray-600">
                        <p>No completed matches yet.</p>
                     </div>
                  }
              </div>
           }
           
           <!-- VIEW: RULES -->
           @if (activeTab() === 'rules') {
              <div class="glass-panel p-8 rounded-2xl">
                 <h2 class="text-3xl gaming-font text-white mb-8 border-l-4 border-cyan-500 pl-4">OFFICIAL RULEBOOK</h2>
                 
                 <div class="space-y-6">
                    @for (rule of comp.rules; track rule.code) {
                        <div class="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                           <div class="flex items-center gap-3 mb-2">
                              <span class="px-2 py-1 bg-cyan-900/40 text-cyan-400 font-mono font-bold rounded text-sm">{{ rule.code }}</span>
                              <h3 class="text-lg font-bold text-white">{{ rule.title }}</h3>
                           </div>
                           <p class="text-gray-400 text-sm leading-relaxed pl-12">{{ rule.description }}</p>
                        </div>
                    }
                    @if (!comp.rules || comp.rules.length === 0) {
                       <div class="text-center py-10 text-gray-500">
                          <div class="text-4xl mb-2">📜</div>
                          <p>Rulebook not yet published.</p>
                       </div>
                    }
                 </div>
              </div>
           }

        </div>
      </div>
    } @else {
       <div class="min-h-screen flex flex-col items-center justify-center">
          <h1 class="text-4xl gaming-font text-gray-700 mb-4">404</h1>
          <a routerLink="/app/competitions" class="text-white hover:text-cyan-400 transition-colors">Torna ai Tornei</a>
       </div>
    }
  `
})
export class CompetitionDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  competitionId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  competition = computed(() => this.store.competitions().find(c => c.id === this.competitionId()));
  
  // Tab State
  activeTab = signal<'upcoming' | 'bracket' | 'calendar' | 'results' | 'rules'>('upcoming');
  
  constructor() {
      this.route.queryParams.subscribe(params => {
          if (params['tab']) {
              this.activeTab.set(params['tab']);
          }
      });
  }
  
  // Calendar State
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

  // --- Dynamic Calendar Logic ---
  calendarData = computed(() => {
      const curr = this.currentDate();
      const year = curr.getFullYear();
      const month = curr.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
      
      const days: { day: number | null, dateStr: string, matches: any[] }[] = [];
      
      // Padding
      for (let i = 0; i < startingDayOfWeek; i++) {
          days.push({ day: null, dateStr: '', matches: [] });
      }
      
      // Days
      for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const dayMatches = this.matches().filter(m => m.date.startsWith(dateStr));
          days.push({ day: i, dateStr, matches: dayMatches });
      }
      
      const monthLabel = curr.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      return { monthLabel, days };
  });

  prevMonth() {
      this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  
  nextMonth() {
      this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  // --- Dynamic Bracket Logic ---
  bracketRounds = computed(() => {
      const matches = this.matches();
      // Get unique rounds
      const rounds = Array.from(new Set(matches.map(m => m.round))).filter(r => r);
      
      // Define logical order
      const order = ['Round 1', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Grand Final'];
      
      // Sort rounds
      const sortedRounds = rounds.sort((a, b) => {
          let idxA = order.indexOf(a || '');
          let idxB = order.indexOf(b || '');
          // If not in order list, put at the beginning
          if (idxA === -1) idxA = -99;
          if (idxB === -1) idxB = -99;
          return idxA - idxB;
      });
      
      return sortedRounds.map(r => ({
          name: r,
          matches: matches.filter(m => m.round === r)
      }));
  });

  // --- Standings Logic (Round Robin) ---
  standings = computed(() => {
      const comp = this.competition();
      if (!comp || comp.format !== 'round_robin') return [];
      
      const stats: Record<string, { played: number, w: number, l: number, pts: number }> = {};
      
      // Initialize
      comp.registeredTeams?.forEach(tid => {
          const team = this.store.teams().find(t => t.id === tid);
          if (team) {
              stats[team.name] = { played: 0, w: 0, l: 0, pts: 0 };
          }
      });
      
      // Calculate
      this.matches().forEach(m => {
          // Ensure teams exist in stats (in case of manual match creation)
          if (!stats[m.teamA]) stats[m.teamA] = { played: 0, w: 0, l: 0, pts: 0 };
          if (!stats[m.teamB]) stats[m.teamB] = { played: 0, w: 0, l: 0, pts: 0 };

          if (m.status === 'completed') {
              stats[m.teamA].played++;
              stats[m.teamB].played++;
              
              if (m.scoreA > m.scoreB) {
                  stats[m.teamA].w++;
                  stats[m.teamA].pts += 3;
                  stats[m.teamB].l++;
              } else if (m.scoreB > m.scoreA) {
                  stats[m.teamB].w++;
                  stats[m.teamB].pts += 3;
                  stats[m.teamA].l++;
              } else {
                  stats[m.teamA].pts += 1;
                  stats[m.teamB].pts += 1;
              }
          }
      });
      
      return Object.entries(stats)
        .map(([name, stat]) => ({ name, ...stat }))
        .sort((a, b) => b.pts - a.pts || b.w - a.w);
  });

  // Helpers for Class Binding
  getTabClass(tabName: string) {
     const base = "px-6 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-wider ";
     if (this.activeTab() === tabName) {
         if (tabName === 'upcoming' || tabName === 'calendar' || tabName === 'rules') return base + "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]";
         if (tabName === 'bracket') return base + "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]";
         return base + "bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(232,121,249,0.4)]";
     }
     return base + "text-gray-400 hover:text-white";
  }
}