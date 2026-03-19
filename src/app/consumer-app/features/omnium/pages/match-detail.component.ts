import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService, Match } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (match(); as m) {
      <div class="min-h-screen bg-black text-white pb-32 animate-soft-in">

        <!-- HERO SECTION -->
        <div class="relative h-[40vh] md:h-[50vh] w-full flex items-center justify-center overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
          <img [src]="competition()?.image" class="absolute inset-0 w-full h-full object-cover opacity-20 scale-105" alt="Competition Background">
          
          <div class="relative z-20 text-center max-w-7xl mx-auto px-6 flex flex-col items-center">
            
            <!-- TEAM A -->
            <div class="flex flex-col items-center gap-6">
              <a [routerLink]="['/app/teams', teamA()?.id]" class="group">
                <img [src]="teamA()?.logo" class="h-24 w-24 md:h-40 md:w-40 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
              </a>
              <h1 class="text-3xl md:text-6xl font-black uppercase tracking-tighter gaming-font italic text-white">{{ m.teamA }}</h1>
            </div>

            <!-- VS & INFO -->
            <div class="my-8 md:my-2">
              <p class="text-4xl md:text-7xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] font-mono">VS</p>
              <p class="text-sm font-black text-gray-500 uppercase tracking-[0.3em] mt-4 font-mono">{{ m.round }}</p>
              <p class="text-xs font-bold text-gray-600 uppercase tracking-widest mt-2">{{ m.date | date:'fullDate' }} • {{ m.date | date:'shortTime' }}</p>
            </div>
            
            <!-- TEAM B -->
            <div class="flex flex-col items-center gap-6">
              <h1 class="text-3xl md:text-6xl font-black uppercase tracking-tighter gaming-font italic text-white">{{ m.teamB }}</h1>
              <a [routerLink]="['/app/teams', teamB()?.id]" class="group">
                <img [src]="teamB()?.logo" class="h-24 w-24 md:h-40 md:w-40 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
              </a>
            </div>

          </div>
        </div>

        <!-- MAIN CONTENT AREA -->
        <div class="max-w-4xl mx-auto px-6 mt-16 text-left">
          
          <!-- RESULT TERMINAL -->
          @if (canInteract()) {
            <div class="bg-[#0a0a0f] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-left">
              <div class="absolute -top-16 -right-16 w-64 h-64 bg-fuchsia-500/5 blur-[80px]"></div>
              <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-fuchsia-500 pl-6 leading-none">Result Terminal</h3>
              
              <!-- Case 1: Match scheduled, show input form -->
              @if (m.status === 'scheduled' && isMyMatch()) {
                <div class="space-y-6">
                  <p class="text-gray-400 italic">The match has concluded. As team captain, you must submit the final score for verification.</p>
                  <div class="flex items-center gap-6 bg-black/20 p-6 rounded-2xl border border-white/10">
                    <input type="number" [(ngModel)]="scoreA" class="input text-3xl font-black font-mono w-full !text-center !rounded-xl">
                    <span class="text-4xl font-mono text-gray-600">:</span>
                    <input type="number" [(ngModel)]="scoreB" class="input text-3xl font-black font-mono w-full !text-center !rounded-xl">
                  </div>
                  <button (click)="proposeResult(m)" class="w-full h-16 rounded-2xl bg-fuchsia-600 text-white font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_#d946ef]">
                    Propose Final Score
                  </button>
                </div>
              }

              <!-- Case 2: Match disputed, show confirmation options -->
              @if (m.status === 'disputed' && isMyMatch()) {
                @if (hasOpponentProposed(m)) {
                  <div class="space-y-6 text-center">
                    <p class="text-yellow-400 font-black tracking-widest uppercase text-sm">Opponent has proposed a result!</p>
                    <div class="p-8 bg-black/40 rounded-3xl border border-yellow-500/30">
                      <p class="text-lg text-gray-400 font-bold">Proposed Score:</p>
                      <p class="text-7xl font-black font-mono text-white my-4">
                        {{ proposedScore(m)?.a }} : {{ proposedScore(m)?.b }}
                      </p>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                      <button (click)="confirmResult(m.id)" class="h-16 rounded-2xl bg-green-500 text-black font-black uppercase tracking-widest hover:scale-105 transition-transform">
                        Confirm Result
                      </button>
                      <button class="h-16 rounded-2xl bg-red-500/20 text-red-500 font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                        Dispute (Contact Admin)
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="py-10 text-center border-2 border-dashed border-cyan-500/20 rounded-3xl">
                    <p class="text-cyan-400 font-black text-lg tracking-widest uppercase">Awaiting Opponent Confirmation</p>
                    <p class="text-gray-500 mt-2">Your proposed result of <strong class="text-white font-mono">{{ proposedScore(m)?.a }} : {{ proposedScore(m)?.b }}</strong> has been sent.</p>
                  </div>
                }
              }

              <!-- Case 3: Admin Override -->
              @if (isAdmin()) {
                <div class="mt-12 pt-8 border-t border-white/10 space-y-4">
                   <h4 class="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 text-center">Admin Override</h4>
                   <div class="flex items-center gap-6 bg-black/20 p-6 rounded-2xl border border-red-500/20">
                     <input type="number" [(ngModel)]="scoreA" class="input text-3xl font-black font-mono w-full !text-center !rounded-xl">
                     <span class="text-4xl font-mono text-gray-600">:</span>
                     <input type="number" [(ngModel)]="scoreB" class="input text-3xl font-black font-mono w-full !text-center !rounded-xl">
                   </div>
                   <button (click)="forceResult(m.id)" class="w-full h-14 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest hover:scale-105 transition-transform">
                     Force Final Score
                   </button>
                </div>
              }

              <!-- Case 4: Match completed -->
              @if (m.status === 'completed') {
                <div class="py-10 text-center">
                  <i class="fa-solid fa-check-circle text-5xl text-green-500"></i>
                  <p class="text-green-400 font-black text-lg tracking-widest uppercase mt-6">Result Confirmed</p>
                  <p class="text-7xl font-black font-mono text-white my-4">{{ m.scoreA }} : {{ m.scoreB }}</p>
                </div>
              }

            </div>
          }
          
        </div>
      </div>
    } @else {
      <div class="min-h-screen bg-black flex flex-col items-center justify-center p-10">
         <i class="fa-solid fa-ghost text-6xl text-gray-800 mb-8 animate-bounce"></i>
         <h1 class="text-4xl font-black text-gray-700 uppercase tracking-widest gaming-font">Match Data Not Found</h1>
         <a routerLink="/app/competitions" class="mt-8 text-cyan-400 font-black uppercase text-xs tracking-[0.4em] hover:text-white transition-colors">Browse Competitions</a>
      </div>
    }
  `
})
export class MatchDetailComponent {
  route = inject(ActivatedRoute);
  store = inject(StoreService);

  matchId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  match = computed(() => this.store.getMatchById(this.matchId())());
  
  competition = computed(() => {
    const m = this.match();
    return m ? this.store.getCompetitionById(m.competitionId)() : undefined;
  });

  teamA = computed(() => {
    const m = this.match();
    return m ? this.store.teams().find(t => t.name === m.teamA) : undefined;
  });

  teamB = computed(() => {
    const m = this.match();
    return m ? this.store.teams().find(t => t.name === m.teamB) : undefined;
  });
  
  scoreA = 0;
  scoreB = 0;

  currentUser = computed(() => this.store.currentUser());

  isMyMatch = computed(() => {
    const user = this.currentUser();
    const teamA = this.teamA();
    const teamB = this.teamB();
    if (!user || (!teamA && !teamB)) return false;
    return user.id === teamA?.captainId || user.id === teamB?.captainId;
  });

  isAdmin = computed(() => {
    const user = this.currentUser();
    return user && (user.role === 'admin' || user.role === 'super_admin');
  });

  canInteract = computed(() => this.isMyMatch() || this.isAdmin());

  proposedScore = (m: Match) => m.proposedScoreA || m.proposedScoreB;

  hasOpponentProposed = (m: Match) => {
    const user = this.currentUser();
    if (!user) return false;
    const teamA = this.teamA();
    const mySide = user.id === teamA?.captainId ? 'A' : 'B';
    return (mySide === 'A' && m.proposedScoreB) || (mySide === 'B' && m.proposedScoreA);
  };

  proposeResult(m: Match) {
    const user = this.currentUser();
    if (!user) return;
    const teamA = this.teamA();
    const myTeamName = user.id === teamA?.captainId ? teamA.name : this.teamB()?.name;
    if (!myTeamName) return;

    this.store.proposeResult(m.id, this.scoreA, this.scoreB, myTeamName);
  }

  confirmResult(matchId: string) {
    this.store.confirmResult(matchId);
  }

  forceResult(matchId: string) {
    if (confirm('ADMIN ACTION: Are you sure you want to force this result?')) {
      this.store.forceResult(matchId, this.scoreA, this.scoreB);
    }
  }
}
