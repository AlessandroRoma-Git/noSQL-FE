import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (team(); as t) {
      <div class="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20">
        
        <!-- Header Profile -->
        <div class="glass-panel p-8 md:p-12 rounded-3xl mb-12 relative overflow-hidden">
           <!-- Bg decoration -->
           <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]"></div>
           
           <div class="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              <div class="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-black border border-white/10 p-2 shadow-2xl">
                 <img [src]="t.logo" class="w-full h-full object-cover rounded-xl" alt="Logo">
              </div>
              
              <div class="text-center md:text-left flex-grow">
                 <h1 class="text-5xl md:text-7xl gaming-font text-white mb-2">{{ t.name }}</h1>
                 <p class="text-gray-400 max-w-2xl mb-6">{{ t.description || 'No description available for this team.' }}</p>
                 
                 <div class="flex flex-wrap justify-center md:justify-start gap-6">
                    <div class="flex flex-col">
                       <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Founded</span>
                       <span class="text-white font-mono">{{ t.founded }}</span>
                    </div>
                    <div class="w-px h-8 bg-white/10 hidden md:block"></div>
                    <div class="flex flex-col">
                       <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Win Rate</span>
                       <span class="text-green-400 font-mono">{{ (t.wins / (t.wins + t.losses) * 100) | number:'1.0-0' }}%</span>
                    </div>
                    <div class="w-px h-8 bg-white/10 hidden md:block"></div>
                    <div class="flex flex-col">
                       <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Record</span>
                       <span class="text-white font-mono">{{ t.wins }}W - {{ t.losses }}L</span>
                    </div>
                 </div>
              </div>
              
              <div class="flex flex-col gap-3">
                 <button class="px-8 py-3 rounded-full bg-cyan-500 text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                    CHALLENGE
                 </button>
                 
                 @if (canJoin()) {
                    @if (hasPending()) {
                        <button disabled class="px-8 py-3 rounded-full bg-yellow-500/10 text-yellow-500 font-bold border border-yellow-500/20 opacity-80 cursor-not-allowed">
                            REQUEST PENDING
                        </button>
                    } @else {
                        <button (click)="requestJoin()" [disabled]="isRequesting()" class="px-8 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white hover:text-black transition-all border border-white/20 disabled:opacity-50 disabled:cursor-wait">
                           {{ isRequesting() ? 'SENDING...' : 'REQUEST TO JOIN' }}
                        </button>
                    }
                 }
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <!-- Roster -->
           <div class="lg:col-span-2">
              <h2 class="text-2xl gaming-font text-white mb-6 pl-2 border-l-4 border-cyan-500">ACTIVE ROSTER</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 @for (member of t.members; track member) {
                    <div class="glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer">
                       <img [src]="'https://picsum.photos/seed/' + member + '/100/100'" class="w-16 h-16 rounded-lg bg-gray-800 object-cover group-hover:scale-105 transition-transform">
                       <div>
                          <div class="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{{ member }}</div>
                          <div class="text-xs text-gray-500 uppercase tracking-wider">Player</div>
                       </div>
                    </div>
                 }
              </div>
           </div>

           <!-- Recent Matches -->
           <div>
              <h2 class="text-2xl gaming-font text-white mb-6 pl-2 border-l-4 border-fuchsia-500">RECENT MATCHES</h2>
              <div class="space-y-4">
                 @for (match of teamMatches(); track match.id) {
                    <div class="glass-panel p-4 rounded-xl flex items-center justify-between text-sm">
                       <div class="flex items-center gap-2">
                          <span [class.text-cyan-400]="match.teamA === t.name" [class.text-white]="match.teamA !== t.name" class="font-bold">{{ match.teamA }}</span>
                          <span class="text-gray-600">vs</span>
                          <span [class.text-cyan-400]="match.teamB === t.name" [class.text-white]="match.teamB !== t.name" class="font-bold">{{ match.teamB }}</span>
                       </div>
                       
                       @if (match.status === 'completed') {
                          <span class="font-mono text-gray-400">{{ match.scoreA }} - {{ match.scoreB }}</span>
                       } @else {
                          <span class="text-[10px] text-gray-500 uppercase">{{ match.status }}</span>
                       }
                    </div>
                 }
                 @if (teamMatches().length === 0) {
                    <div class="text-gray-500 text-sm">No matches found.</div>
                 }
              </div>
           </div>
        </div>

      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center text-gray-500">Team not found</div>
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

  // Computed that checks if currentUser has a pending request for THIS team
  hasPending = computed(() => {
     return this.store.hasPendingRequest(this.teamId())();
  });

  canJoin = computed(() => {
      const user = this.store.currentUser();
      const t = this.team();
      // Check if user is logged in, is a player, does NOT have a team, and isn't already in this team
      return user && user.role === 'player' && !user.teamId && t && !t.members.includes(user.name);
  });

  requestJoin() {
      this.isRequesting.set(true);
      // Simulate network
      setTimeout(() => {
         this.store.requestJoinTeam(this.teamId());
         this.isRequesting.set(false);
      }, 500);
  }
}