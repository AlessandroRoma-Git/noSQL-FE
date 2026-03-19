import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Match } from '../services/store.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      @for (match of matches; track match.id) {
        <div class="card-soft p-10 hover:bg-white/[0.06] transition-all flex flex-col md:flex-row items-center justify-between gap-12 group border border-white/5 shadow-2xl relative overflow-hidden rounded-[2.5rem] bg-black/40">
          <div class="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-all"></div>
          
          <!-- Info Match -->
          <div class="text-center md:text-left w-48 shrink-0">
            <div class="text-cyan-400 font-black text-2xl uppercase tracking-tighter mb-1">{{ match.date | date:'MMM dd' }}</div>
            <div class="text-gray-500 text-base font-mono font-black">{{ match.date | date:'HH:mm' }}</div>
            <div class="mt-4 px-4 py-1.5 bg-white/5 rounded-xl text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] inline-block border border-white/10 text-center">{{ match.round }}</div>
          </div>

          <!-- Squadre e Punteggio -->
          <div class="flex items-center gap-10 md:gap-20 flex-grow justify-center text-center">
            <div class="text-right flex-1 min-w-0">
              <span class="font-black text-3xl uppercase tracking-tighter truncate block group-hover:text-cyan-400 transition-colors"
                    [class.text-white]="!isResult || match.scoreA >= match.scoreB"
                    [class.text-gray-600]="isResult && match.scoreA < match.scoreB">{{ match.teamA }}</span>
            </div>

            @if (isResult) {
              <div class="px-8 py-3 bg-black/60 rounded-2xl font-mono font-black text-4xl text-white border border-white/10 shadow-inner">
                <span [class.text-fuchsia-500]="match.scoreA > match.scoreB">{{ match.scoreA }}</span>
                <span class="mx-4 text-gray-800">:</span>
                <span [class.text-fuchsia-500]="match.scoreB > match.scoreA">{{ match.scoreB }}</span>
              </div>
            } @else {
              <div class="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-xs font-black text-gray-700 border border-white/10 italic shrink-0 group-hover:border-cyan-500/30 group-hover:text-cyan-500 transition-all">VS</div>
            }

            <div class="text-left flex-1 min-w-0">
              <span class="font-black text-3xl uppercase tracking-tighter truncate block group-hover:text-cyan-400 transition-colors"
                    [class.text-white]="!isResult || match.scoreB >= match.scoreA"
                    [class.text-gray-600]="isResult && match.scoreB < match.scoreA">{{ match.teamB }}</span>
            </div>
          </div>

          <!-- Azioni -->
          <div class="flex gap-4">
            @if (canEdit) {
              <button (click)="onEdit.emit(match)" class="w-14 h-14 rounded-2xl bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center border border-white/5">
                <i class="fa-solid fa-pen-to-square text-lg"></i>
              </button>
            }
            <a [routerLink]="['/app/matches', match.id]" class="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center border border-cyan-500/20 shadow-xl">
              <i class="fa-solid fa-bolt-lightning text-lg"></i>
            </a>
          </div>
        </div>
      } @empty {
        <div class="py-20 text-center card-soft border-dashed border-2 border-white/5 opacity-50 rounded-[2.5rem]">
          <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">No matches found in this sector.</p>
        </div>
      }
    </div>
  `
})
export class MatchListComponent {
  @Input() matches: Match[] = [];
  @Input() canEdit: boolean = false;
  @Input() isResult: boolean = false;
  @Output() onEdit = new EventEmitter<Match>();
}
