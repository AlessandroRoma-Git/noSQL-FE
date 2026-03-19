import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match, Team } from '../services/store.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full space-y-12 animate-soft-in">
      
      <!-- HERO PODIUM (Top 3) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto px-4">
        
        <!-- 2nd Place -->
        @if (rankedTeams()[1]; as silver) {
          <div class="order-2 md:order-1 group">
            <div class="relative bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center backdrop-blur-xl transition-all hover:border-slate-400/50 hover:-translate-y-2">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(148,163,184,0.5)]">
                <span class="text-black font-black text-xl italic">2</span>
              </div>
              <div class="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mb-4">Silver Medal</div>
              <h3 class="text-2xl font-black text-white uppercase truncate">{{ silver.name }}</h3>
              <div class="mt-4 text-4xl font-black text-slate-400 font-mono">{{ silver.pts }}<span class="text-xs ml-1 uppercase">pts</span></div>
            </div>
          </div>
        }

        <!-- 1st Place -->
        @if (rankedTeams()[0]; as gold) {
          <div class="order-1 md:order-2 group">
            <div class="relative bg-cyan-500/10 border-2 border-cyan-500/50 rounded-[2.5rem] p-12 text-center backdrop-blur-2xl transition-all hover:scale-105 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_#22d3ee]">
                <i class="fa-solid fa-crown text-black text-3xl"></i>
              </div>
              <div class="text-sm text-cyan-400 font-black uppercase tracking-[0.4em] mb-4">Tournament Leader</div>
              <h3 class="text-4xl font-black text-white uppercase truncate tracking-tighter">{{ gold.name }}</h3>
              <div class="mt-6 text-6xl font-black text-cyan-400 font-mono drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{{ gold.pts }}<span class="text-sm ml-2 uppercase">pts</span></div>
            </div>
          </div>
        }

        <!-- 3rd Place -->
        @if (rankedTeams()[2]; as bronze) {
          <div class="order-3 md:order-3 group">
            <div class="relative bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center backdrop-blur-xl transition-all hover:border-amber-700/50 hover:-translate-y-2">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(180,83,9,0.5)]">
                <span class="text-white font-black text-xl italic">3</span>
              </div>
              <div class="text-xs text-amber-600 font-black uppercase tracking-[0.3em] mb-4">Bronze Medal</div>
              <h3 class="text-2xl font-black text-white uppercase truncate">{{ bronze.name }}</h3>
              <div class="mt-4 text-4xl font-black text-amber-600 font-mono">{{ bronze.pts }}<span class="text-xs ml-1 uppercase">pts</span></div>
            </div>
          </div>
        }
      </div>

      <!-- REMAINING RANKS TABLE -->
      <div class="max-w-6xl mx-auto px-4">
        <div class="card-soft overflow-hidden border-white/10">
          <table class="w-full text-left">
            <thead class="bg-white/5">
              <tr class="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em]">
                <th class="px-8 py-6">Rank</th>
                <th class="px-8 py-6">Squad Entity</th>
                <th class="px-8 py-6 text-center">Wins</th>
                <th class="px-8 py-6 text-center">Losses</th>
                <th class="px-8 py-6 text-center">Win Rate</th>
                <th class="px-8 py-6 text-right">Final Score</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (team of rankedTeams().slice(3); track team.name; let i = $index) {
                <tr class="hover:bg-white/[0.03] transition-colors group">
                  <td class="px-8 py-6 font-mono text-gray-600 text-lg">#{{ i + 4 }}</td>
                  <td class="px-8 py-6 font-black text-white text-xl uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{{ team.name }}</td>
                  <td class="px-8 py-6 text-center text-green-400 font-bold font-mono">{{ team.w }}</td>
                  <td class="px-8 py-6 text-center text-red-500/50 font-mono">{{ team.l }}</td>
                  <td class="px-8 py-6 text-center">
                    <div class="inline-flex items-center gap-2">
                      <div class="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-cyan-500" [style.width.%]="(team.w / (team.played || 1)) * 100"></div>
                      </div>
                      <span class="text-[10px] font-mono text-gray-500">{{ ((team.w / (team.played || 1)) * 100) | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-right font-black text-white text-2xl font-mono">{{ team.pts }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LeaderboardComponent {
  @Input() matches: Match[] = [];
  @Input() registeredTeamIds: string[] = [];
  @Input() allTeams: Team[] = [];

  rankedTeams = computed(() => {
    const stats: Record<string, { played: number, w: number, l: number, pts: number }> = {};
    
    this.registeredTeamIds.forEach(tid => {
      const team = this.allTeams.find(t => t.id === tid);
      if (team) stats[team.name] = { played: 0, w: 0, l: 0, pts: 0 };
    });

    this.matches.forEach(m => {
      if (m.status === 'completed') {
        if (!stats[m.teamA]) stats[m.teamA] = { played: 0, w: 0, l: 0, pts: 0 };
        if (!stats[m.teamB]) stats[m.teamB] = { played: 0, w: 0, l: 0, pts: 0 };
        
        stats[m.teamA].played++; stats[m.teamB].played++;
        
        if (m.scoreA > m.scoreB) {
          stats[m.teamA].w++; stats[m.teamA].pts += 3;
          stats[m.teamB].l++;
        } else if (m.scoreB > m.scoreA) {
          stats[m.teamB].w++; stats[m.teamB].pts += 3;
          stats[m.teamA].l++;
        } else {
          stats[m.teamA].pts += 1; stats[m.teamB].pts += 1;
        }
      }
    });

    return Object.entries(stats)
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.pts - a.pts || b.w - a.w);
  });
}
