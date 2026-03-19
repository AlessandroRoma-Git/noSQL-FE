import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../services/store.service';

@Component({
  selector: 'app-bracket',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full overflow-x-auto custom-scrollbar pb-20 pt-10">
      <div class="inline-flex gap-0 min-w-full pt-10 h-auto">
        @for (round of bracketRounds(); track round.name; let rIdx = $index) {
          <div class="flex flex-col min-w-[350px] md:min-w-[420px]">
            
            <!-- Header Round -->
            <div class="h-20 flex items-center justify-center px-8 shrink-0 mb-10">
              <div class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 text-center shadow-xl backdrop-blur-xl">
                <span class="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">{{ round.name }}</span>
              </div>
            </div>

            <!-- Matches Column -->
            <div class="flex flex-col">
              @for (match of round.matches; track match.id; let mIdx = $index) {
                <!-- Mathematical Slot -->
                <div [style.height.px]="slotHeight * Math.pow(2, rIdx)" class="flex items-center relative px-8">
                  
                  <!-- Match Card -->
                  <div class="w-full glass-panel !p-0 overflow-hidden border-white/10 hover:border-cyan-500/50 transition-all duration-500 group shadow-2xl relative z-10 bg-[#0a0a0f]/95 backdrop-blur-3xl rounded-2xl">
                    <div class="flex justify-between items-center h-16 px-6 border-b border-white/5" 
                         [class.bg-cyan-500/10]="match.scoreA > match.scoreB && match.status === 'completed'">
                      <span class="text-sm font-black uppercase tracking-widest truncate flex-1" 
                            [class.text-gray-700]="match.teamA === 'TBD'">{{ match.teamA }}</span>
                      <span class="text-2xl font-mono font-black border-l border-white/10 pl-6 ml-4 w-12 text-center text-cyan-400 italic">
                        {{ match.scoreA }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center h-16 px-6" 
                         [class.bg-cyan-500/10]="match.scoreB > match.scoreA && match.status === 'completed'">
                      <span class="text-sm font-black uppercase tracking-widest truncate flex-1" 
                            [class.text-gray-700]="match.teamB === 'TBD'">{{ match.teamB }}</span>
                      <span class="text-2xl font-mono font-black border-l border-white/10 pl-6 ml-4 w-12 text-center text-cyan-400 italic">
                        {{ match.scoreB }}
                      </span>
                    </div>

                    @if (canEdit) {
                      <button (click)="onEdit.emit(match)" class="absolute top-1/2 right-[-15px] -translate-y-1/2 w-10 h-10 rounded-full bg-cyan-500 text-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center justify-center hover:scale-110">
                        <i class="fa-solid fa-bolt-lightning text-xs"></i>
                      </button>
                    }
                  </div>

                  <!-- PERFECT PIPES -->
                  @if (rIdx < bracketRounds().length - 1) {
                    <!-- Exit Line -->
                    <div class="absolute right-0 top-1/2 w-8 h-[2px] bg-white/10 z-0"></div>
                    
                    @if (mIdx % 2 === 0) {
                      <!-- Vertical Connection (Down) -->
                      <div class="absolute right-0 top-1/2 w-[2px] bg-white/10 z-0" 
                           [style.height.px]="slotHeight * Math.pow(2, rIdx)"></div>
                      <!-- Junction Horizontal Line -->
                      <div class="absolute right-[-40px] w-[40px] h-[2px] bg-white/10 z-0" 
                           [style.top.px]="(slotHeight * Math.pow(2, rIdx))"></div>
                    }
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .glass-panel { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); }
    .custom-scrollbar::-webkit-scrollbar { height: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.4); }
  `]
})
export class BracketComponent {
  @Input() matches: Match[] = [];
  @Input() canEdit: boolean = false;
  @Output() onEdit = new EventEmitter<Match>();

  Math = Math;
  slotHeight = 180; // Base height for Round 1

  bracketRounds = computed(() => {
    const roundNames = ['Round 1', 'Round of 16', 'Round of 8', 'Quarterfinals', 'Semifinals', 'Grand Final'];
    const roundsFound = Array.from(new Set(this.matches.map(m => m.round))).filter(r => r);
    
    const sortedRounds = roundsFound.sort((a, b) => {
      let idxA = roundNames.indexOf(a || '');
      let idxB = roundNames.indexOf(b || '');
      if (idxA === -1) idxA = 99;
      if (idxB === -1) idxB = 99;
      return idxA - idxB;
    });

    return sortedRounds.map(r => ({
      name: r,
      matches: this.matches.filter(m => m.round === r).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));
  });
}
