import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoreService } from '../services/store.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen pt-10 px-6 max-w-7xl mx-auto pb-20 relative">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 class="text-6xl gaming-font text-white mb-2">TEAMS</h1>
          <p class="text-gray-400 font-light max-w-md">Esplora i profili delle squadre d'élite che competono per la gloria eterna su OMNIUM.</p>
        </div>
        
        <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          @if (canCreateTeam()) {
             <button (click)="isCreating.set(true)" class="px-6 py-3 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(232,121,249,0.3)] hover:scale-105">
                CREA IL TUO TEAM
             </button>
          }

          <div class="relative w-full md:w-auto">
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Cerca team..." 
              class="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-cyan-500/50 w-full md:w-80 transition-all placeholder:text-gray-600">
            <svg class="absolute right-4 top-3.5 text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (team of filteredTeams(); track team.id) {
          <div [routerLink]="['/app/teams', team.id]" class="glass-panel p-6 rounded-2xl group hover:bg-white/5 transition-all duration-300 relative overflow-hidden cursor-pointer">
            <!-- Subtle gradient orb on hover -->
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="flex items-center gap-5 mb-8 relative z-10">
              <img [src]="team.logo" class="w-16 h-16 rounded-xl object-cover shadow-lg" alt="Logo">
              <div>
                <h2 class="text-2xl gaming-font text-white leading-none mb-1">{{ team.name }}</h2>
                <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Est. {{ team.founded }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8 relative z-10">
               <div class="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
                 <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Win Rate</div>
                 <div class="text-xl font-bold text-white">{{ (team.wins / (team.wins + team.losses) * 100) | number:'1.0-0' }}%</div>
               </div>
               <div class="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
                 <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Matches</div>
                 <div class="text-xl font-bold text-white">{{ team.wins + team.losses }}</div>
               </div>
            </div>

            <div class="relative z-10">
               <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 @for (member of team.members; track member) {
                   <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 whitespace-nowrap">{{ member }}</span>
                 }
               </div>
            </div>
          </div>
        }
        @if (filteredTeams().length === 0) {
           <div class="col-span-full py-20 text-center">
              <p class="text-gray-500 text-lg">Nessun team trovato.</p>
           </div>
        }
      </div>

      <!-- Creation Modal -->
      @if (isCreating()) {
         <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="isCreating.set(false)"></div>
            <div class="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
               <h2 class="text-3xl gaming-font text-white mb-6">FONDA IL TUO TEAM</h2>
               
               <div class="space-y-4">
                  <div>
                     <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Nome Team</label>
                     <input type="text" [(ngModel)]="newTeamName" class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none" placeholder="Es. Shadow Hunters">
                  </div>
                  <div>
                     <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Motto / Descrizione</label>
                     <textarea [(ngModel)]="newTeamDesc" rows="3" class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none" placeholder="We play to win..."></textarea>
                  </div>
                  
                  <div class="flex gap-3 mt-6">
                     <button (click)="isCreating.set(false)" class="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white font-bold transition">ANNULLA</button>
                     <button (click)="confirmCreate()" class="flex-1 py-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold transition shadow-lg shadow-fuchsia-900/30">CREA</button>
                  </div>
               </div>
            </div>
         </div>
      }

    </div>
  `
})
export class TeamsComponent {
  store = inject(StoreService);
  searchQuery = signal('');
  
  // Creation State
  isCreating = signal(false);
  newTeamName = '';
  newTeamDesc = '';

  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.store.teams().filter(t => t.name.toLowerCase().includes(query));
  });

  canCreateTeam = computed(() => {
     const user = this.store.currentUser();
     // Only a logged in player who does NOT already have a team can create one
     return user && user.role === 'player' && !user.teamId;
  });

  confirmCreate() {
     if (this.newTeamName.trim()) {
        this.store.createTeam(this.newTeamName, this.newTeamDesc);
        this.isCreating.set(false);
        this.newTeamName = '';
        this.newTeamDesc = '';
     } else {
        this.store.addNotification('Il nome del team è obbligatorio', 'warning');
     }
  }
}