import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match, Team } from '../services/store.service';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-6">
      <div class="card-soft p-12 border-white/10 shadow-2xl bg-[#0a0a0f]/80 rounded-[2rem] text-left">
        <h3 class="text-4xl font-black text-white mb-16 uppercase tracking-tighter gaming-font border-l-8 border-cyan-500 pl-8 leading-none italic">Standings</h3>
        <table class="w-full text-left">
          <thead>
            <tr class="text-[11px] uppercase font-black text-gray-600 tracking-[0.5em] border-b border-white/10">
              <th class="px-8 py-6 text-left">Pos</th>
              <th class="px-8 py-6 text-left">Squad</th>
              <th class="px-8 py-6 text-center font-mono">PL</th>
              <th class="px-8 py-6 text-center text-green-400 font-mono">W</th>
              <th class="px-8 py-6 text-center text-red-500 font-mono">L</th>
              <th class="px-8 py-6 text-right font-mono">Points</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            @for (team of standings(); track team.name; let i = $index) {
              <tr class="hover:bg-white/[0.04] transition-all group font-black italic">
                <td class="px-8 py-8 font-mono text-gray-700 text-xl font-black italic">0{{ i + 1 }}</td>
                <td class="px-8 py-8 font-black text-white text-2xl uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">{{ team.name }}</td>
                <td class="px-8 py-8 text-center text-gray-500 font-bold font-mono text-lg">{{ team.played }}</td>
                <td class="px-8 py-8 text-center text-green-400 font-black font-mono text-xl">{{ team.w }}</td>
                <td class="px-8 py-8 text-center text-red-500/40 font-mono text-xl">{{ team.l }}</td>
                <td class="px-8 py-8 text-right font-black text-cyan-400 text-4xl tracking-tighter italic font-mono">{{ team.pts }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StandingsComponent {
  @Input() matches: Match[] = [];
  @Input() registeredTeamIds: string[] = [];
  @Input() allTeams: Team[] = [];

  standings = computed(() => {
    const stats: Record<string, { played: number, w: number, l: number, pts: number }> = {};
    
    // Inizializza team registrati
    this.registeredTeamIds.forEach(tid => {
      const team = this.allTeams.find(t => t.id === tid);
      if (team) stats[team.name] = { played: 0, w: 0, l: 0, pts: 0 };
    });

    // Calcola statistiche dai match completati
    this.matches.forEach(m => {
      if (m.status === 'completed') {
        if (!stats[m.teamA]) stats[m.teamA] = { played: 0, w: 0, l: 0, pts: 0 };
        if (!stats[m.teamB]) stats[m.teamB] = { played: 0, w: 0, l: 0, pts: 0 };
        
        stats[m.teamA].played++;
        stats[m.teamB].played++;
        
        if (m.scoreA > m.scoreB) {
          stats[m.teamA].w++; stats[m.teamA].pts += 3;
          stats[m.teamB].l++;
        } else if (m.scoreB > m.scoreA) {
          stats[m.teamB].w++; stats[m.teamB].pts += 3;
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
}
