import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService, Team } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#050505] p-6 md:p-12 space-y-16 animate-soft-in">
      
      <!-- HERO HEADER -->
      <header class="max-w-7xl mx-auto space-y-6 pt-10 text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-3">
          <span class="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_15px_#d946ef] animate-pulse"></span>
          <span class="text-fuchsia-500 font-black text-xs tracking-[0.4em] uppercase">Squad Directory</span>
        </div>
        <h1 class="text-6xl md:text-9xl font-black gaming-font leading-none uppercase tracking-tighter italic text-white">
          TEAM <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">ELITE</span>
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl font-medium italic mx-auto md:mx-0">
          Discover the top organizations and rising squads. Join a team or build your own legend.
        </p>
      </header>

      <!-- TOOLS BAR -->
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between px-4">
        <div class="relative w-full md:w-96 group">
          <i class="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-fuchsia-500 transition-colors"></i>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search squads..." 
                 class="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-gray-600 italic shadow-inner text-white">
        </div>

        <button (click)="openCreateModal()" class="w-full md:w-auto px-10 h-14 bg-fuchsia-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-fuchsia-500 transition-all shadow-[0_0_30px_rgba(217,70,239,0.3)]">
          <i class="fa-solid fa-plus mr-3"></i> Create Your Squad
        </button>
      </div>

      <!-- TEAMS GRID -->
      <section class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
        @for (team of filteredTeams(); track team.id) {
          <div class="group bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.05] hover:border-fuchsia-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden">
            <!-- Glass Decorative Element -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-[60px] -z-10 group-hover:bg-fuchsia-500/10 transition-colors"></div>
            
            <div class="flex flex-col items-center text-center space-y-6">
              <div class="relative">
                <div class="w-24 h-24 rounded-[2rem] bg-white/5 p-4 border border-white/10 group-hover:scale-110 group-hover:border-fuchsia-500/50 transition-all duration-500">
                  <img [src]="team.logo" class="w-full h-full object-contain" [alt]="team.name">
                </div>
                <div class="absolute -bottom-2 -right-2 px-3 py-1 bg-fuchsia-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                  {{ team.members.length }} Active
                </div>
              </div>

              <div class="space-y-1">
                <h3 class="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-fuchsia-400 transition-colors">{{ team.name }}</h3>
                <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">Founded {{ team.founded }}</p>
              </div>

              <div class="w-full grid grid-cols-2 gap-3">
                <div class="bg-black/40 rounded-xl p-3 border border-white/5">
                  <div class="text-[8px] text-gray-600 font-black uppercase mb-1">Wins</div>
                  <div class="text-xl font-black text-green-400 font-mono leading-none">{{ team.wins }}</div>
                </div>
                <div class="bg-black/40 rounded-xl p-3 border border-white/5">
                  <div class="text-[8px] text-gray-600 font-black uppercase mb-1">Losses</div>
                  <div class="text-xl font-black text-red-500/50 font-mono leading-none">{{ team.losses }}</div>
                </div>
              </div>

              <div class="w-full pt-4 space-y-3">
                <a [routerLink]="['/app/teams', team.id]" class="block w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all">
                  Squad Profile
                </a>
                @if (canJoin(team)) {
                  <button (click)="requestJoin(team.id)" class="w-full py-3 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-fuchsia-500 hover:text-white transition-all shadow-lg">
                    Request Entry
                  </button>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-40 text-center card-soft border-dashed border-2 border-white/5 opacity-30 rounded-[3rem]">
            <i class="fa-solid fa-users-slash text-5xl mb-6 text-gray-700"></i>
            <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-sm italic">No organizations found in this sector.</p>
          </div>
        }
      </section>

      <!-- CREATE TEAM MODAL -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-soft-in">
          <div class="card-soft w-full max-w-2xl overflow-hidden border-fuchsia-500/30 shadow-[0_0_100px_rgba(217,70,239,0.2)] rounded-[3rem]">
            <div class="bg-white/[0.02] border-b border-white/10 p-10 flex justify-between items-center relative">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"></div>
              <div class="space-y-1">
                <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font leading-none italic">
                  Found <span class="text-fuchsia-400 italic">New Squad</span>
                </h3>
                <p class="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Establish your competitive identity</p>
              </div>
              <button (click)="showCreateModal.set(false)" class="w-12 h-12 rounded-full bg-white/5 text-gray-500 hover:text-white transition-all flex items-center justify-center border border-white/5"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <div class="p-10 space-y-10 bg-[#0a0a0f]">
              <div class="space-y-8">
                <div class="space-y-4 text-left">
                  <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic ml-4">Organization Name</label>
                  <input type="text" [(ngModel)]="newTeam.name" class="input h-16 text-xl font-black !rounded-2xl border-white/10 shadow-inner italic focus:border-fuchsia-500 text-white" placeholder="Team Name">
                </div>

                <div class="space-y-4 text-left">
                  <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic ml-4">Visual Identity (Logo)</label>
                  <input type="text" [(ngModel)]="newTeam.logo" class="input h-14 text-sm font-bold !rounded-2xl border-white/10 shadow-inner italic focus:border-fuchsia-500 text-white" placeholder="Logo URL">
                </div>

                <div class="space-y-4 text-left">
                  <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic ml-4">Squad Philosophy</label>
                  <textarea [(ngModel)]="newTeam.description" class="input min-h-[120px] py-4 text-sm font-medium !rounded-2xl border-white/10 shadow-inner italic focus:border-fuchsia-500 text-white" placeholder="Describe your team's goals and values..."></textarea>
                </div>
              </div>
            </div>

            <div class="bg-black/80 border-t border-white/10 p-10 flex justify-end gap-6">
              <button (click)="showCreateModal.set(false)" class="px-10 h-14 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.2em] italic">Abort</button>
              <button (click)="saveTeam()" class="button-primary px-16 h-14 !bg-fuchsia-600 !text-white text-[11px] font-black uppercase shadow-2xl !rounded-2xl tracking-[0.3em]">Initialize Squad</button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class TeamsComponent {
  store = inject(StoreService);
  searchQuery = '';
  showCreateModal = signal(false);
  newTeam = { name: '', logo: '', description: '' };

  filteredTeams = computed(() => {
    const list = this.store.teams();
    if (!this.searchQuery) return list;
    const q = this.searchQuery.toLowerCase();
    return list.filter(t => t.name.toLowerCase().includes(q));
  });

  canJoin(team: Team): boolean {
    const user = this.store.currentUser();
    if (!user) return false;
    // Non può unirsi se ha già una richiesta pendente o è già membro
    return !this.store.hasPendingRequest(team.id)() && !team.members.includes(user.name);
  }

  openCreateModal() {
    this.newTeam = { name: '', logo: '', description: '' };
    this.showCreateModal.set(true);
  }

  saveTeam() {
    if (this.newTeam.name) {
      this.store.createTeam(this.newTeam.name, this.newTeam.description, this.newTeam.logo);
      this.showCreateModal.set(false);
    }
  }

  requestJoin(teamId: string) {
    this.store.requestJoinTeam(teamId);
  }
}
