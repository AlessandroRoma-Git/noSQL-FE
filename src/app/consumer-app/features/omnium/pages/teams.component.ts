import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoreService } from '../services/store.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from 'app/common/components/image-picker/image-picker.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ImagePickerComponent],
  template: `
    <div class="min-h-screen pt-10 px-6 w-full pb-20 relative animate-soft-in">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div class="space-y-2">
          <h1 class="text-7xl font-black text-white tracking-tighter gaming-font leading-none">TEAMS</h1>
          <div class="flex items-center gap-3">
            <div class="w-12 h-[2px] bg-fuchsia-500"></div>
            <p class="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Elite squads competing for eternal glory</p>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          @if (canCreateTeam()) {
             <button (click)="isCreating.set(true)" class="button-primary h-14 px-10 !bg-fuchsia-600 !text-white shadow-[0_0_30px_rgba(192,38,211,0.3)]">
                <i class="fa-solid fa-shield-halved mr-3"></i> FONDA IL TUO TEAM
             </button>
          }

          <div class="relative w-full md:w-80 group">
            <i class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-fuchsia-500 transition-colors text-sm"></i>
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Cerca per nome..." 
              class="input pl-14 h-14 !rounded-full bg-white/5 border-white/5 focus:bg-white/10 transition-all font-bold">
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        @for (team of filteredTeams(); track team.id) {
          <div [routerLink]="['/app/teams', team.id]" class="card-soft p-8 group hover:border-fuchsia-500/30 transition-all duration-500 relative overflow-hidden cursor-pointer flex flex-col h-full border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
            <!-- Glass Overlay -->
            <div class="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="flex flex-col items-center text-center mb-8 relative z-10">
              <div class="relative mb-6">
                 <div class="absolute inset-0 bg-fuchsia-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                 <img [src]="team.logo" class="w-24 h-24 rounded-3xl object-cover shadow-2xl relative z-10 border-2 border-white/5 group-hover:border-fuchsia-500/50 transition-all duration-500">
              </div>
              <h2 class="text-3xl font-black text-white leading-none mb-2 uppercase tracking-tighter gaming-font">{{ team.name }}</h2>
              <div class="flex items-center gap-2">
                 <span class="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black">Established</span>
                 <span class="text-[10px] text-fuchsia-400 font-mono font-bold">{{ team.founded }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8 relative z-10">
               <div class="p-4 rounded-2xl bg-black/40 border border-white/5 text-center group-hover:border-fuchsia-500/20 transition-colors">
                 <div class="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Win Rate</div>
                 <div class="text-2xl font-black text-white gaming-font">{{ (team.wins / (team.wins + team.losses || 1) * 100) | number:'1.0-0' }}%</div>
               </div>
               <div class="p-4 rounded-2xl bg-black/40 border border-white/5 text-center group-hover:border-fuchsia-500/20 transition-colors">
                 <div class="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Total Matches</div>
                 <div class="text-2xl font-black text-white gaming-font">{{ team.wins + team.losses }}</div>
               </div>
            </div>

            <div class="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between">
               <div class="flex -space-x-3 overflow-hidden">
                 @for (member of team.members.slice(0, 4); track member) {
                   <div class="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0f0f14] flex items-center justify-center text-[10px] font-black text-gray-400 uppercase" [title]="member">
                      {{ member.charAt(0) }}
                   </div>
                 }
                 @if (team.members.length > 4) {
                    <div class="w-8 h-8 rounded-full bg-fuchsia-500/20 border-2 border-[#0f0f14] flex items-center justify-center text-[8px] font-black text-fuchsia-400">
                       +{{ team.members.length - 4 }}
                    </div>
                 }
               </div>
               <span class="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-white transition-colors">View Profile &rarr;</span>
            </div>
          </div>
        }
        @if (filteredTeams().length === 0) {
           <div class="col-span-full py-40 text-center card-soft border-dashed border-2 border-white/5 flex flex-col items-center">
              <div class="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-3xl text-gray-800 mb-6">
                 <i class="fa-solid fa-users-slash"></i>
              </div>
              <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-sm">Nessun team trovato nei record correnti.</p>
           </div>
        }
      </div>

      <!-- Creation Modal -->
      @if (isCreating()) {
         <div class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-soft-in">
            <div class="card-soft w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10">
               
               <!-- Modal Header -->
               <div class="bg-white/[0.02] border-b border-white/5 p-8 flex justify-between items-center">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center text-xl shadow-inner border border-fuchsia-500/20">
                        <i class="fa-solid fa-shield-halved"></i>
                     </div>
                     <div>
                        <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font leading-none">Crea Team</h3>
                        <p class="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 opacity-60">Inizia il tuo viaggio verso la vetta</p>
                     </div>
                  </div>
                  <button (click)="isCreating.set(false)" class="w-12 h-12 rounded-2xl bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center border border-white/5">
                     <i class="fa-solid fa-xmark text-lg"></i>
                  </button>
               </div>

               <div class="p-8 md:p-12 space-y-12">
                  <!-- Riga 1: Logo (Centrale e grande) -->
                  <div class="space-y-4">
                     <label class="label text-[10px] uppercase font-black tracking-widest text-fuchsia-500 text-center block">Emblema della Squadra</label>
                     <div class="w-48 h-48 mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-2 border-white/5 group-hover:border-fuchsia-500/50 transition-all">
                        <app-image-picker [ngModel]="newTeamLogo" (ngModelChange)="newTeamLogo = $event"></app-image-picker>
                     </div>
                     <p class="text-[9px] text-gray-600 italic text-center px-10">Il logo è il cuore del tuo brand. Carica un'immagine quadrata ad alta risoluzione.</p>
                  </div>

                  <!-- Riga 2: Nome Team -->
                  <div class="space-y-4 pt-10 border-t border-white/5">
                     <label class="label text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <i class="fa-solid fa-signature opacity-30 text-fuchsia-500"></i> Nome Ufficiale
                     </label>
                     <input type="text" [(ngModel)]="newTeamName" class="input h-16 text-xl font-black uppercase tracking-tight" placeholder="Es. SHADOW HUNTERS">
                  </div>

                  <!-- Riga 3: Descrizione -->
                  <div class="space-y-4 pt-10 border-t border-white/5">
                     <label class="label text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <i class="fa-solid fa-quote-left opacity-30 text-fuchsia-500"></i> Storia & Missione
                     </label>
                     <textarea [(ngModel)]="newTeamDesc" rows="5" class="input p-6 text-sm leading-relaxed" placeholder="Racconta chi siete, quali sono i vostri obiettivi e perché i player dovrebbero unirsi a voi..."></textarea>
                  </div>
               </div>
               
               <!-- Modal Footer -->
               <div class="bg-black/20 border-t border-white/5 p-8 md:p-10 flex flex-col md:flex-row justify-end gap-4">
                  <button (click)="isCreating.set(false)" class="button-secondary px-10 h-14 flex items-center justify-center uppercase font-black tracking-widest text-xs min-w-[150px]">
                     Annulla
                  </button>
                  <button (click)="confirmCreate()" class="button-primary px-16 h-14 flex items-center justify-center uppercase font-black tracking-widest text-sm min-w-[250px] !bg-fuchsia-600 !text-white shadow-[0_0_40px_rgba(192,38,211,0.3)]">
                     <i class="fa-solid fa-flag-checkered mr-3"></i> FONDA SQUADRA
                  </button>
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
  newTeamLogo = '';

  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.store.teams().filter(t => t.name.toLowerCase().includes(query));
  });

  canCreateTeam = computed(() => {
     const user = this.store.currentUser();
     return user && user.role === 'player' && !user.teamId;
  });

  confirmCreate() {
     if (this.newTeamName.trim()) {
        // We pass the new logo to the store action
        this.store.createTeam(this.newTeamName, this.newTeamDesc, this.newTeamLogo);
        this.isCreating.set(false);
        this.newTeamName = '';
        this.newTeamDesc = '';
        this.newTeamLogo = '';
     } else {
        this.store.addNotification('Il nome del team è obbligatorio', 'warning');
     }
  }
}
