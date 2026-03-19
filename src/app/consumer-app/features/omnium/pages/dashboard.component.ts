import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, UserRole, User, Review, TournamentFormat, CompetitionRule, Competition } from '../services/store.service';
import { RouterLink } from '@angular/router';
import { ImagePickerComponent } from 'app/common/components/image-picker/image-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ImagePickerComponent],
  template: `
    <div class="min-h-screen w-full px-6 pb-20">
      
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pt-10">
        <div class="space-y-1">
          <h1 class="text-5xl font-black gaming-font text-white tracking-tighter uppercase">
            DASHBOARD
          </h1>
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-[rgb(var(--color-primary))] animate-pulse"></div>
            <p class="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Active Session: <span class="text-white">{{ store.currentUser()?.name }}</span></p>
          </div>
        </div>
        
        <div class="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl flex items-center gap-4 group">
           <div class="flex flex-col items-end">
              <span class="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Access Level</span>
              <span class="text-xs text-cyan-400 font-black uppercase tracking-tighter">{{ store.currentUser()?.role }}</span>
           </div>
           <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover:bg-cyan-500 group-hover:text-black transition-all">
              <i class="fa-solid fa-shield-halved"></i>
           </div>
        </div>
      </div>

      <!-- Content based on Role -->
      @switch (store.currentUser()?.role) {
        
        <!-- ADMIN VIEW -->
        @case ('admin') {
          <!-- Admin Tabs -->
          <div class="flex gap-2 mb-10 p-1 bg-black/40 rounded-[2rem] border border-white/5 w-max overflow-x-auto max-w-full">
             <button (click)="adminTab.set('overview')" [class.bg-[rgb(var(--color-primary))]]="adminTab() === 'overview'" [class.text-black]="adminTab() === 'overview'" class="px-8 py-3 rounded-[1.8rem] text-gray-400 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap">Overview</button>
             <button (click)="adminTab.set('management')" [class.bg-[rgb(var(--color-primary))]]="adminTab() === 'management'" [class.text-black]="adminTab() === 'management'" class="px-8 py-3 rounded-[1.8rem] text-gray-400 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap">Tornei & Giochi</button>
             <button (click)="adminTab.set('users')" [class.bg-[rgb(var(--color-primary))]]="adminTab() === 'users'" [class.text-black]="adminTab() === 'users'" class="px-8 py-3 rounded-[1.8rem] text-gray-400 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap">Gestione Utenti</button>
             <button (click)="adminTab.set('moderation')" [class.bg-[rgb(var(--color-primary))]]="adminTab() === 'moderation'" [class.text-black]="adminTab() === 'moderation'" class="px-8 py-3 rounded-[1.8rem] text-gray-400 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap">Moderazione</button>
          </div>

          @if (adminTab() === 'overview') {
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-soft-in">
               <!-- Stats Widgets -->
               <div class="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div class="card-soft p-8 flex flex-col justify-between h-40 group hover:border-[rgb(var(--color-primary)/0.3)] transition-all">
                     <div class="flex justify-between items-start">
                        <span class="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Utenti Registrati</span>
                        <i class="fa-solid fa-users text-gray-800 group-hover:text-[rgb(var(--color-primary)/0.3)] transition-colors text-xl"></i>
                     </div>
                     <div class="text-5xl font-black text-white gaming-font leading-none">{{ store.users().length }}</div>
                  </div>
                  <div class="card-soft p-8 flex flex-col justify-between h-40 group hover:border-cyan-500/30 transition-all border-l-4 border-l-cyan-500">
                     <div class="flex justify-between items-start">
                        <span class="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Tornei Attivi</span>
                        <i class="fa-solid fa-trophy text-gray-800 group-hover:text-cyan-500/30 transition-colors text-xl"></i>
                     </div>
                     <div class="text-5xl font-black text-cyan-400 gaming-font leading-none">{{ store.competitions().length }}</div>
                  </div>
                  <div class="card-soft p-8 flex flex-col justify-between h-40 group hover:border-red-500/30 transition-all">
                     <div class="flex justify-between items-start">
                        <span class="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Reports Pendenti</span>
                        <i class="fa-solid fa-circle-exclamation text-gray-800 group-hover:text-red-500/30 transition-colors text-xl"></i>
                     </div>
                     <div class="text-5xl font-black text-red-500 gaming-font leading-none">23</div>
                  </div>
                  <div class="card-soft p-8 flex flex-col justify-between h-40 group hover:border-green-500/30 transition-all bg-gradient-to-br from-green-500/5 to-transparent">
                     <div class="flex justify-between items-start">
                        <span class="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Total Revenue</span>
                        <i class="fa-solid fa-wallet text-gray-800 group-hover:text-green-500/30 transition-colors text-xl"></i>
                     </div>
                     <div class="text-5xl font-black text-green-400 gaming-font leading-none">$45k</div>
                  </div>
               </div>

               <div class="lg:col-span-3 card-soft p-10 border-white/5">
                 <h3 class="text-xl font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-3">
                    <i class="fa-solid fa-list-ul text-xs opacity-30"></i>
                    Activity Log
                 </h3>
                 <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><i class="fa-solid fa-user-slash"></i></div>
                          <div>
                             <p class="text-sm text-gray-200 font-bold">Admin1 <span class="text-gray-500 font-medium italic">banned</span> User_99</p>
                             <p class="text-[10px] text-gray-600 uppercase font-black mt-1">Moderation Action</p>
                          </div>
                       </div>
                       <span class="text-[10px] text-gray-600 font-mono group-hover:text-gray-400">2m ago</span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center"><i class="fa-solid fa-plus"></i></div>
                          <div>
                             <p class="text-sm text-gray-200 font-bold">New Tournament <span class="text-cyan-400 font-black">"Apex Winter"</span> created</p>
                             <p class="text-[10px] text-gray-600 uppercase font-black mt-1">Management Action</p>
                          </div>
                       </div>
                       <span class="text-[10px] text-gray-600 font-mono group-hover:text-gray-400">1h ago</span>
                    </div>
                 </div>
               </div>
               
               <div class="card-soft p-10 border-white/5">
                  <h3 class="text-xl font-black text-white mb-8 uppercase tracking-tighter">Quick Actions</h3>
                  <div class="flex flex-col gap-4">
                    <button (click)="adminTab.set('management'); openCompetitionModal()" class="button-primary w-full h-14 !bg-cyan-500 !text-black shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                       CREATE TORNEO
                    </button>
                    <button class="button-secondary w-full h-14 !bg-red-500/10 !text-red-500 !border-red-500/20 hover:!bg-red-500 hover:!text-white transition-all uppercase font-black text-xs tracking-widest">
                       BAN HAMMER
                    </button>
                  </div>
               </div>
            </div>
          }

          @if (adminTab() === 'management') {
             <div class="space-y-12 animate-soft-in">
                <!-- Competitions Section -->
                <div class="card-soft p-10">
                   <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-white/5 pb-8">
                      <div>
                         <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font">Gestione Tornei</h3>
                         <p class="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold opacity-60">Organizza le tue competizioni esports</p>
                      </div>
                      <button (click)="openCompetitionModal()" class="button-primary h-14 px-10 !bg-cyan-500 !text-black shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                         <i class="fa-solid fa-plus mr-3"></i> AGGIUNGI TORNEO
                      </button>
                   </div>
                   
                   <div class="overflow-x-auto custom-scrollbar">
                      <table class="w-full text-left">
                         <thead class="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">
                            <tr>
                               <th class="px-6 py-4">Nome Torneo</th>
                               <th class="px-6 py-4">Titolo</th>
                               <th class="px-6 py-4 text-center">Iscritti</th>
                               <th class="px-6 py-4">Stato</th>
                               <th class="px-6 py-4 text-right">Azioni</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-white/5">
                            @for (comp of store.competitions(); track comp.id) {
                               <tr class="hover:bg-white/[0.03] transition-colors group">
                                  <td class="px-6 py-6 font-black text-white text-sm uppercase tracking-tight">{{ comp.name }}</td>
                                  <td class="px-6 py-6 text-sm text-gray-400 font-bold uppercase tracking-widest">{{ getTitleName(comp.titleId) }}</td>
                                  <td class="px-6 py-6 text-center">
                                     <span class="px-3 py-1 rounded-lg bg-white/5 text-white font-mono text-xs">{{ comp.registeredTeams?.length || 0 }}</span>
                                  </td>
                                  <td class="px-6 py-6">
                                     <span [class]="getStatusColor(comp.status)" class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border tracking-tighter">
                                        {{ comp.status }}
                                     </span>
                                  </td>
                                  <td class="px-6 py-6 text-right">
                                     <div class="flex justify-end gap-2">
                                        @if (comp.status === 'upcoming' || comp.status === 'draft') {
                                           <button 
                                              (click)="store.generateMatches(comp.id)" 
                                              [disabled]="store.isGeneratingMatches() === comp.id"
                                              class="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait" 
                                              title="Genera Calendario (anche con TBD)">
                                              @if (store.isGeneratingMatches() === comp.id) {
                                                 <i class="fa-solid fa-circle-notch animate-spin text-xs"></i>
                                              } @else {
                                                 <i class="fa-solid fa-wand-sparkles text-xs"></i>
                                              }
                                           </button>
                                        }
                                        <a [routerLink]="['/app/competitions', comp.id]" class="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors" title="Visualizza">
                                           <i class="fa-solid fa-eye text-xs"></i>
                                        </a>
                                        <button (click)="editCompetition(comp)" class="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all" title="Modifica">
                                           <i class="fa-solid fa-pen-to-square text-xs"></i>
                                        </button>
                                        <button (click)="deleteCompetition(comp.id)" class="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Elimina">
                                           <i class="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                            }
                         </tbody>
                      </table>
                   </div>
                </div>
          
                <!-- Titles Section -->
                <div class="card-soft p-10">
                   <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-white/5 pb-8">
                      <div>
                         <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font">Libreria Giochi</h3>
                         <p class="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold opacity-60">Gestisci il catalogo dei titoli</p>
                      </div>
                      <button (click)="openTitleModal()" class="button-primary h-14 px-10 !bg-fuchsia-600 !text-white shadow-[0_0_30px_rgba(192,38,211,0.3)]">
                         <i class="fa-solid fa-gamepad mr-3"></i> AGGIUNGI GIOCO
                      </button>
                   </div>
                   
                   <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      @for (title of store.titles(); track title.id) {
                         <div class="card-soft p-6 group hover:border-fuchsia-500/30 transition-all">
                            <div class="flex items-center gap-6">
                               <img [src]="title.image" class="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:scale-110 transition-transform duration-500">
                               <div>
                                  <h4 class="text-white font-black text-sm uppercase tracking-tight">{{ title.name }}</h4>
                                  <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{{ title.publisher }}</p>
                               </div>
                            </div>
                            <div class="flex justify-end mt-6">
                               <button (click)="deleteTitle(title.id)" class="text-red-500/50 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest">
                                  Elimina Titolo
                               </button>
                            </div>
                         </div>
                      }
                   </div>
                </div>
             </div>
          }

          @if (adminTab() === 'users') {
            <div class="card-soft p-10 animate-soft-in">
               <h3 class="text-2xl font-black text-white mb-10 uppercase tracking-tighter gaming-font leading-none">Gestione Utenti</h3>
               <div class="overflow-x-auto">
                  <table class="w-full text-left">
                     <thead class="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">
                        <tr>
                           <th class="px-6 py-4 text-center">User</th>
                           <th class="px-6 py-4">Role</th>
                           <th class="px-6 py-4">Status</th>
                           <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-white/5">
                        @for (u of store.users(); track u.id) {
                           <tr class="hover:bg-white/[0.03] transition-colors">
                              <td class="px-6 py-6 flex items-center gap-4">
                                 <img [src]="u.avatar" class="w-10 h-10 rounded-full border border-white/10">
                                 <span class="text-white font-black text-sm uppercase tracking-tight">{{ u.name }}</span>
                              </td>
                              <td class="px-6 py-6">
                                 <span class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">{{ u.role }}</span>
                              </td>
                              <td class="px-6 py-6">
                                 <span [class]="u.status === 'banned' ? 'text-red-500' : 'text-green-400'" class="text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 rounded-full" [class.bg-red-500]="u.status === 'banned'" [class.bg-green-400]="u.status !== 'banned'"></span>
                                    {{ u.status }}
                                 </span>
                              </td>
                              <td class="px-6 py-6 text-right">
                                 @if (u.status !== 'banned') {
                                    <button (click)="banUser(u.id)" class="text-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">BAN</button>
                                 }
                              </td>
                           </tr>
                        }
                     </tbody>
                  </table>
               </div>
            </div>
          }

          @if (adminTab() === 'moderation') {
             <div class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-soft-in">
                @for (review of store.reviews(); track review.id) {
                   <div class="card-soft p-8 flex gap-6 hover:border-red-500/30 transition-all">
                      <img [src]="review.avatar" class="w-16 h-16 rounded-2xl bg-gray-700 object-cover border border-white/10">
                      <div class="flex-grow">
                         <div class="flex justify-between items-start mb-4">
                            <div>
                               <div class="font-black text-white text-sm uppercase tracking-tight">{{ review.authorName }}</div>
                               <div class="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Caster: {{ review.casterId }}</div>
                            </div>
                            <div class="text-yellow-400 text-xs font-black">★ {{ review.rating }}/5</div>
                         </div>
                         <p class="text-gray-400 text-xs leading-relaxed mb-6 italic">"{{ review.comment }}"</p>
                         <div class="flex justify-end">
                            <button (click)="deleteReview(review.id)" class="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all">CANCELLA FEEDBACK</button>
                         </div>
                      </div>
                   </div>
                }
                @if (store.reviews().length === 0) {
                   <div class="col-span-2 py-32 text-center card-soft border-dashed border-2 border-white/5">
                      <p class="text-gray-600 font-black uppercase tracking-[0.2em] text-xs">Nessuna recensione da moderare</p>
                   </div>
                }
             </div>
          }

          <!-- COMPETITION MODAL -->
          @if (showCompModal()) {
             <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md animate-soft-in">
                <div class="card-soft w-full max-w-4xl h-full md:h-auto max-h-[95vh] overflow-y-auto custom-scrollbar relative border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                   
                   <div class="sticky top-0 z-50 bg-[#0f0f14]/80 backdrop-blur-xl border-b border-white/5 p-8 flex justify-between items-center">
                      <div class="flex items-center gap-4">
                         <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl border border-cyan-500/20 shadow-inner">
                            <i class="fa-solid fa-trophy"></i>
                         </div>
                         <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font leading-none">
                            {{ editingCompId() ? 'Configura Torneo' : 'Nuova Competizione' }}
                         </h3>
                      </div>
                      <button (click)="closeCompetitionModal()" class="w-12 h-12 rounded-2xl bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center border border-white/5">
                         <i class="fa-solid fa-xmark text-lg"></i>
                      </button>
                   </div>
                   
                   <div class="p-8 md:p-12 space-y-16">
                      <div class="space-y-10">
                         <div class="group">
                            <label class="label text-[10px] uppercase font-black tracking-widest flex items-center gap-2 mb-4 text-cyan-400">
                               <i class="fa-solid fa-signature opacity-30"></i> Nome Ufficiale
                            </label>
                            <input type="text" [(ngModel)]="newCompName" placeholder="Es. OMNIUM WINTER CHAMPIONSHIP" class="input h-16 text-xl font-black uppercase tracking-tight">
                         </div>

                         <div class="group pt-10 border-t border-white/5">
                            <label class="label text-[10px] uppercase font-black tracking-widest flex items-center gap-2 mb-4 text-cyan-400">
                               <i class="fa-solid fa-gamepad opacity-30"></i> Titolo di Gioco
                            </label>
                            <div class="relative">
                               <select [(ngModel)]="newCompTitleId" class="input h-20 appearance-none font-black text-xl !pl-8 bg-white/[0.07] border-none shadow-2xl">
                                  <option value="" disabled>-- Scegli il gioco dal catalogo --</option>
                                  @for (t of store.titles(); track t.id) {
                                     <option [value]="t.id">{{ t.name }}</option>
                                  }
                               </select>
                               <i class="fa-solid fa-chevron-down absolute right-8 top-1/2 -translate-y-1/2 text-cyan-500 text-xl pointer-events-none"></i>
                            </div>
                         </div>
                      </div>

                      <div class="space-y-6 pt-10 border-t border-white/5 text-center">
                         <label class="label text-[10px] uppercase font-black tracking-widest text-cyan-400 mb-6">Copertina del Torneo (16:9)</label>
                         <app-image-picker [ngModel]="newCompImage" (ngModelChange)="newCompImage = $event"></app-image-picker>
                      </div>

                      <div class="space-y-12 pt-10 border-t border-white/5">
                         <label class="label text-xs uppercase font-black tracking-widest text-cyan-400 mb-8 block">Configurazione Match & Player</label>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div class="space-y-8">
                               <div>
                                  <label class="label text-[10px] uppercase font-black tracking-widest mb-4">Montepremi</label>
                                  <div class="relative">
                                     <i class="fa-solid fa-sack-dollar absolute left-6 top-1/2 -translate-y-1/2 text-green-500 text-xl"></i>
                                     <input type="text" [(ngModel)]="newCompPrize" placeholder="$ 0.00" class="input h-16 !pl-16 text-2xl font-black text-green-400">
                                  </div>
                               </div>
                               <div>
                                  <label class="label text-[10px] uppercase font-black tracking-widest mb-4">Formato</label>
                                  <select [(ngModel)]="newCompFormat" class="input h-16 font-black uppercase text-sm">
                                     <option value="single_elimination">Eliminazione Diretta</option>
                                     <option value="double_elimination">Doppia Eliminazione</option>
                                     <option value="round_robin">Round Robin (Girone)</option>
                                     <option value="swiss">Swiss System</option>
                                  </select>
                               </div>
                               @if (newCompFormat === 'round_robin') {
                                  <div class="animate-soft-in">
                                     <label class="label text-[10px] uppercase font-black tracking-widest mb-4 text-fuchsia-400">Tipo Girone</label>
                                     <select [(ngModel)]="newCompRoundRobinType" class="input h-16 font-bold">
                                        <option value="single">Sola Andata</option>
                                        <option value="double">Andata e Ritorno</option>
                                     </select>
                                  </div>
                               }
                            </div>
                            <div class="space-y-8 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                               <div class="grid grid-cols-2 gap-6">
                                  <div>
                                     <label class="label text-[9px] uppercase font-black mb-3">Best Of (Match)</label>
                                     <input type="number" [(ngModel)]="newCompRules" class="input h-14 font-mono text-center text-lg">
                                  </div>
                                  <div>
                                     <label class="label text-[9px] uppercase font-black mb-3">Max Team</label>
                                     <input type="number" [(ngModel)]="newCompMaxTeams" class="input h-14 font-mono text-center text-lg">
                                  </div>
                               </div>
                               <div class="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                  <div>
                                     <label class="label text-[9px] uppercase font-black mb-3">Min Player/Team</label>
                                     <input type="number" [(ngModel)]="newCompMinPlayers" class="input h-14 font-mono text-center text-lg">
                                  </div>
                                  <div>
                                     <label class="label text-[9px] uppercase font-black mb-3">Max Player/Team</label>
                                     <input type="number" [(ngModel)]="newCompMaxPlayers" class="input h-14 font-mono text-center text-lg">
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div class="space-y-12 pt-10 border-t border-white/5">
                         <div>
                            <label class="label text-[10px] uppercase font-black tracking-widest mb-6 text-orange-400">Scheduling Avanzato</label>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                               <div class="space-y-2">
                                  <span class="text-[9px] font-black text-gray-600 uppercase ml-2">DATA INIZIO</span>
                                  <input type="date" [(ngModel)]="newCompStartDate" class="input h-14 font-mono">
                               </div>
                               <div class="space-y-2">
                                  <span class="text-[9px] font-black text-gray-600 uppercase ml-2">DATA FINE</span>
                                  <input type="date" [(ngModel)]="newCompEndDate" class="input h-14 font-mono">
                               </div>
                               <div class="space-y-2">
                                  <span class="text-[9px] font-black text-gray-600 uppercase ml-2">ORARIO INIZIO MATCH</span>
                                  <input type="time" [(ngModel)]="newCompStartTime" class="input h-14 font-mono text-center">
                               </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                               <div>
                                  <label class="label text-[10px] uppercase font-black tracking-widest mb-6">Attività Settimanale</label>
                                  <div class="flex flex-wrap gap-3">
                                     @for (day of daysOfWeek; track $index) {
                                        <button (click)="toggleDay($index)"
                                           [class.bg-cyan-500]="newCompPlayDays.includes($index)"
                                           [class.text-black]="newCompPlayDays.includes($index)"
                                           class="w-14 h-14 rounded-2xl text-[10px] font-black uppercase transition-all border border-white/10">
                                           {{ day }}
                                        </button>
                                     }
                                  </div>
                               </div>
                               <div class="grid grid-cols-2 gap-6">
                                  <div>
                                     <label class="label text-[9px] uppercase font-black mb-3">Match/Giorno</label>
                                     <input type="number" [(ngModel)]="newCompMatchesPerDay" class="input h-14 font-mono text-center">
                                  </div>
                                  <div>
                                     <label class="label text-[9px] uppercase font-black mb-3">Durata (Min)</label>
                                     <input type="number" [(ngModel)]="newCompRoundDuration" class="input h-14 font-mono text-center">
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <!-- Footer -->
                   <div class="sticky bottom-0 z-50 bg-[#0f0f14]/90 backdrop-blur-xl border-t border-white/5 p-8 md:p-10 flex flex-col md:flex-row justify-end gap-4">
                      <button (click)="closeCompetitionModal()" class="button-secondary px-10 h-14 font-black uppercase tracking-widest text-xs">ANNULLA</button>
                      <button (click)="saveCompetition(false)" class="button-primary px-16 h-14 font-black uppercase tracking-widest text-sm !bg-cyan-500 !text-black shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                         <i class="fa-solid fa-paper-plane mr-3"></i> PUBBLICA TORNEO
                      </button>
                   </div>
                </div>
             </div>
          }

          <!-- TITLE MODAL -->
          @if (showTitleModal()) {
             <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-md animate-soft-in">
                <div class="card-soft w-full max-w-3xl h-full md:h-auto max-h-[95vh] overflow-y-auto custom-scrollbar relative border-white/10 shadow-2xl">
                   <div class="p-8 md:p-12 space-y-12">
                      <div class="flex justify-between items-center mb-6">
                         <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font leading-none border-l-4 border-fuchsia-500 pl-6">
                            Nuovo <span class="text-fuchsia-500">Titolo</span>
                         </h3>
                         <button (click)="closeTitleModal()" class="text-gray-600 hover:text-white transition-colors"><i class="fa-solid fa-xmark text-2xl"></i></button>
                      </div>
                      <div class="space-y-4">
                         <label class="label text-[10px] uppercase font-black tracking-widest text-fuchsia-400 text-center block">Cover Art</label>
                         <app-image-picker [ngModel]="newTitleImage" (ngModelChange)="newTitleImage = $event"></app-image-picker>
                      </div>
                      <div class="space-y-8 pt-10 border-t border-white/5">
                         <div class="group">
                            <label class="label text-[10px] uppercase font-black mb-3">Nome del Gioco</label>
                            <input type="text" [(ngModel)]="newTitleName" placeholder="Es. Valorant" class="input h-16 text-xl font-black uppercase tracking-tight">
                         </div>
                         <div class="group pt-8 border-t border-white/[0.02]">
                            <label class="label text-[10px] uppercase font-black mb-3">Publisher</label>
                            <input type="text" [(ngModel)]="newTitlePublisher" placeholder="Es. Riot Games" class="input h-16 text-lg font-bold">
                         </div>
                      </div>
                      <div class="space-y-4 pt-10 border-t border-white/5">
                         <label class="label text-[10px] uppercase font-black tracking-widest">Descrizione & Bio</label>
                         <textarea [(ngModel)]="newTitleDesc" rows="5" class="input p-6 text-sm leading-relaxed" placeholder="Scrivi una breve presentazione del titolo..."></textarea>
                      </div>
                      <div class="flex justify-end gap-4 pt-10 border-t border-white/5">
                         <button (click)="closeTitleModal()" class="button-secondary h-14 px-10 font-black text-xs uppercase tracking-widest">Annulla</button>
                         <button (click)="createTitle()" class="button-primary h-14 px-16 font-black text-sm uppercase tracking-widest !bg-fuchsia-600 !text-white shadow-[0_0_30px_rgba(192,38,211,0.2)]">AGGIUNGI TITOLO</button>
                      </div>
                   </div>
                </div>
             </div>
          }
        }

        <!-- MODERATOR VIEW -->
        @case ('moderator') {
           <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-soft-in">
              <div class="lg:col-span-2">
                 <h2 class="text-2xl font-black text-white mb-8 pl-4 border-l-4 border-orange-500 gaming-font uppercase tracking-tighter">Manage Competitions</h2>
                 <div class="space-y-4">
                    @for (comp of store.competitions(); track comp.id) {
                       <div class="card-soft p-6 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                          <div class="flex items-center gap-6">
                             <img [src]="comp.image" class="w-20 h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-500">
                             <div>
                                <div class="font-black text-white uppercase tracking-tight">{{ comp.name }}</div>
                                <div class="text-[9px] text-gray-500 uppercase tracking-widest font-black mt-1">{{ comp.status }}</div>
                             </div>
                          </div>
                          <div class="flex gap-3">
                             <button class="button-secondary-sm h-10 px-4 !rounded-lg uppercase font-black tracking-tighter">EDIT</button>
                             <button (click)="deleteCompetition(comp.id)" class="button-danger-sm h-10 px-4 !rounded-lg uppercase font-black tracking-tighter">DELETE</button>
                          </div>
                       </div>
                    }
                 </div>
              </div>
              <div>
                 <h2 class="text-2xl font-black text-white mb-8 pl-4 border-l-4 border-red-500 gaming-font uppercase tracking-tighter">Reports</h2>
                 <div class="card-soft p-10 text-center bg-gradient-to-b from-red-500/5 to-transparent">
                    <div class="text-6xl font-black text-white gaming-font mb-4 leading-none">{{ store.reviews().length }}</div>
                    <div class="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black">Active Reports</div>
                    <button (click)="adminTab.set('moderation'); switchRole('admin')" class="mt-10 w-full button-primary !bg-red-500 !text-white h-14 uppercase tracking-widest font-black shadow-[0_0_30px_rgba(239,68,68,0.3)]">REVIEW ALL</button>
                 </div>
              </div>
           </div>
        }

        <!-- PLAYER VIEW -->
        @case ('player') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-soft-in">
            <!-- Profile Card -->
            <div class="lg:col-span-1 space-y-8">
               <div class="card-soft p-10 text-center relative overflow-hidden group border-white/10">
                  <div class="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-black/40"></div>
                  <div class="relative z-10">
                    <div class="relative w-32 h-32 mx-auto mb-8">
                       <img [src]="store.currentUser()?.avatar" class="w-full h-full rounded-[2.5rem] border-4 border-white/10 object-cover shadow-2xl group-hover:scale-105 transition-transform duration-700">
                       <div class="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-cyan-500 text-black flex items-center justify-center text-lg shadow-lg border-4 border-[#0f0f14]">
                          <i class="fa-solid fa-bolt"></i>
                       </div>
                    </div>
                    <h2 class="text-4xl font-black text-white mb-2 tracking-tighter gaming-font uppercase">{{ store.currentUser()?.name }}</h2>
                    <p class="text-cyan-400 text-[10px] font-black uppercase tracking-[0.25em] mb-10">Team: <span class="text-white">{{ getMyTeamName() || 'No Team' }}</span></p>
                    <div class="grid grid-cols-2 gap-4 mb-10">
                      <div class="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
                        <div class="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">ELO Rating</div>
                        <div class="text-3xl font-black text-white gaming-font">{{ store.currentUser()?.elo }}</div>
                      </div>
                      <div class="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
                        <div class="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Winrate</div>
                        <div class="text-3xl font-black text-green-400 gaming-font">68%</div>
                      </div>
                    </div>
                    @if(store.currentUser()?.teamId) {
                      <button [routerLink]="['/app/teams', store.currentUser()?.teamId]" class="button-primary w-full h-14 !bg-white !text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]">TEAM PROFILE</button>
                    } @else {
                      <button routerLink="/app/teams" class="button-primary w-full h-14 !bg-cyan-500 !text-black animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.3)] font-black uppercase tracking-widest text-xs">FIND TEAM</button>
                    }
                  </div>
               </div>
               <!-- RECRUITMENT -->
               @if (store.myTeamRequests().length > 0) {
                   <div class="card-soft p-8 border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
                       <h3 class="text-xs font-black text-white mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                           <span class="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse"></span>
                           RECRUITMENT
                       </h3>
                       <div class="space-y-4">
                           @for (req of store.myTeamRequests(); track req.id) {
                               <div class="bg-black/40 p-5 rounded-3xl border border-white/5 animate-soft-in">
                                   <div class="flex items-center gap-4 mb-5">
                                       <img [src]="req.userAvatar" class="w-12 h-12 rounded-xl border border-white/10 object-cover">
                                       <div>
                                           <div class="font-black text-white text-sm uppercase tracking-tight">{{ req.userName }}</div>
                                           <div class="text-[9px] text-gray-500 font-black uppercase tracking-widest">Wants to join</div>
                                       </div>
                                   </div>
                                   <div class="flex gap-2">
                                       <button (click)="store.respondToRequest(req.id, true)" class="flex-1 h-10 bg-green-500 text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all">ACCEPT</button>
                                       <button (click)="store.respondToRequest(req.id, false)" class="flex-1 h-10 bg-white/5 text-gray-400 text-[10px] font-black uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all">REJECT</button>
                                   </div>
                               </div>
                           }
                       </div>
                   </div>
               }
            </div>
            <!-- Matches Section -->
            <div class="lg:col-span-2 space-y-10">
               <div class="flex items-center gap-4">
                  <div class="w-1 h-8 bg-cyan-500 rounded-full"></div>
                  <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font">Upcoming Matches</h3>
               </div>
               @if (store.myMatches().length === 0) {
                 <div class="p-20 rounded-[3rem] border-2 border-dashed border-white/5 text-center flex flex-col items-center">
                   <div class="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-3xl text-gray-700 mb-6 shadow-inner">
                      <i class="fa-solid fa-calendar-xmark"></i>
                   </div>
                   <p class="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">No matches scheduled at the moment.</p>
                 </div>
               }
               <div class="grid grid-cols-1 gap-6">
                  @for (match of store.myMatches(); track match.id) {
                    <div class="card-soft p-10 flex flex-col gap-10 group hover:border-cyan-500/30 transition-all border-white/5">
                       <div class="flex flex-col md:flex-row items-center gap-10">
                          <div class="flex flex-col items-center justify-center w-24 h-24 bg-white/5 rounded-3xl border border-white/5 shrink-0 shadow-inner group-hover:bg-cyan-500/10 transition-colors">
                            <span class="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Nov</span>
                            <span class="text-4xl font-black text-white gaming-font leading-none uppercase">20</span>
                          </div>
                          <div class="flex flex-col md:flex-row items-center gap-8 flex-grow justify-center py-4 px-10 bg-black/40 rounded-[3rem] border border-white/5">
                             <div class="text-center md:text-right flex-1">
                                <span class="font-black text-2xl uppercase tracking-tighter transition-all" [class.text-cyan-400]="match.teamA === getMyTeamName()" [class.text-white]="match.teamA !== getMyTeamName()">{{ match.teamA }}</span>
                             </div>
                             <div class="flex flex-col items-center gap-1 shrink-0">
                                <span class="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em]">VERSUS</span>
                                <div class="w-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                             </div>
                             <div class="text-center md:text-left flex-1">
                                <span class="font-black text-2xl uppercase tracking-tighter transition-all" [class.text-cyan-400]="match.teamB === getMyTeamName()" [class.text-white]="match.teamB !== getMyTeamName()">{{ match.teamB }}</span>
                             </div>
                          </div>
                       </div>
                       @if (match.status === 'scheduled' || match.status === 'live') {
                          <div class="w-full bg-cyan-500/5 p-8 rounded-[2.5rem] border border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-8 animate-soft-in">
                              <div class="flex items-center gap-4">
                                 <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                                    <i class="fa-solid fa-gamepad"></i>
                                 </div>
                                 <div class="flex flex-col">
                                    <span class="text-[10px] text-cyan-400/60 font-black uppercase tracking-widest">Captains Console</span>
                                    <span class="text-xs text-white font-black uppercase tracking-tight">Report Match Results</span>
                                 </div>
                              </div>
                              @if (!isConfirmed(match)) {
                                 <div class="flex items-center gap-6">
                                   <div class="flex items-center gap-3">
                                       <input type="number" [(ngModel)]="matchInputs[match.id + '_A']" class="w-16 h-14 text-center bg-black/60 rounded-2xl text-2xl font-black text-white border-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-inner">
                                       <span class="text-gray-600 font-black text-xl">:</span>
                                       <input type="number" [(ngModel)]="matchInputs[match.id + '_B']" class="w-16 h-14 text-center bg-black/60 rounded-2xl text-2xl font-black text-white border-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-inner">
                                   </div>
                                   <button (click)="confirmMatch(match)" class="button-primary h-14 px-10 !bg-green-500 !text-black text-[10px] font-black shadow-[0_0_30px_rgba(34,197,94,0.2)] uppercase tracking-widest">
                                     CONFIRM
                                   </button>
                                 </div>
                              } @else {
                                 <div class="px-8 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                                   <i class="fa-solid fa-circle-check text-green-500 animate-bounce"></i>
                                   <span class="text-green-500 text-xs font-black uppercase tracking-widest">Score Confirmed</span>
                                 </div>
                              }
                          </div>
                       } @else if (match.status === 'disputed') {
                           <div class="w-full bg-red-500/10 border border-red-500/30 p-6 rounded-[2.5rem] flex items-center justify-center gap-4 text-red-500 animate-pulse">
                               <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
                               <div class="flex flex-col text-center md:text-left">
                                  <span class="text-xs font-black uppercase tracking-[0.2em]">Match Disputed</span>
                                  <span class="text-[10px] font-black uppercase opacity-80 mt-1">Admin intervention required.</span>
                               </div>
                           </div>
                       }
                    </div>
                  }
               </div>
            </div>
          </div>
        }

        <!-- CASTER VIEW -->
        @case ('caster') {
           <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-soft-in">
              <div class="card-soft p-10 lg:col-span-1 h-fit">
                 <h3 class="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-8 border-b border-white/5 pb-4">Performance</h3>
                 <div class="flex items-center gap-6 mb-12">
                    <div class="text-7xl font-black text-white leading-none gaming-font">4.8</div>
                    <div class="flex flex-col">
                       <div class="flex text-yellow-400 text-sm mb-1">
                          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i>
                       </div>
                       <span class="text-[9px] text-gray-600 font-black uppercase tracking-widest">Rating</span>
                    </div>
                 </div>
                 <div class="space-y-4">
                    <div class="p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner">
                        <div class="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">Total Casts</div>
                        <div class="text-4xl font-black text-white gaming-font leading-none uppercase">124</div>
                    </div>
                    <div class="pt-4">
                       <div class="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-4 px-1">Badges</div>
                       <div class="flex flex-wrap gap-2">
                          <span class="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black rounded-xl uppercase tracking-tighter">Voice of God</span>
                          <span class="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black rounded-xl uppercase tracking-tighter">Veteran</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div class="lg:col-span-2 space-y-8">
                 <div class="flex items-center gap-4">
                    <div class="w-1 h-8 bg-fuchsia-500 rounded-full"></div>
                    <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font">Open Casting Slots</h3>
                 </div>
                 <div class="space-y-4">
                    @for (match of store.availableCasts(); track match.id) {
                       <div class="card-soft p-8 flex flex-col sm:flex-row justify-between items-center gap-8 hover:border-fuchsia-500/30 transition-all group">
                          <div class="flex flex-col sm:flex-row items-center gap-8">
                             <div class="w-16 h-16 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10 shrink-0">
                                <span class="text-xl font-black text-white gaming-font leading-none">22</span>
                                <span class="text-[8px] text-gray-500 font-black uppercase mt-1">NOV</span>
                             </div>
                             <div>
                                <div class="text-[9px] text-fuchsia-400 font-black uppercase tracking-[0.2em] mb-2 group-hover:animate-pulse">Open Broadcast</div>
                                <div class="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4 leading-none">
                                   {{ match.teamA }} <span class="text-gray-700 text-xs italic font-serif uppercase">vs</span> {{ match.teamB }}
                                </div>
                                <div class="text-[10px] text-gray-500 font-mono mt-3 uppercase tracking-widest">Scheduled: {{ match.date }}</div>
                             </div>
                          </div>
                          <button (click)="assignCaster(match.id)" class="button-primary h-14 px-10 !bg-fuchsia-600 !text-white text-xs font-black shadow-[0_0_30px_rgba(192,38,211,0.2)] hover:scale-105 transition-all">
                             CLAIM SLOT
                          </button>
                       </div>
                    }
                    @if (store.availableCasts().length === 0) {
                      <div class="p-20 card-soft border-dashed border-white/5 text-center flex flex-col items-center">
                         <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-700 text-2xl mb-6 shadow-inner">
                            <i class="fa-solid fa-microphone-slash"></i>
                         </div>
                         <p class="text-gray-500 font-black uppercase tracking-widest text-xs">No broadcast slots available right now.</p>
                      </div>
                    }
                 </div>
              </div>
           </div>
        }

        @default {
           <div class="flex flex-col items-center justify-center py-40 animate-soft-in">
              <div class="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-4xl text-gray-800 mb-8 border border-white/5 shadow-inner">
                 <i class="fa-solid fa-ghost"></i>
              </div>
              <h2 class="text-3xl font-black text-gray-600 uppercase tracking-tighter gaming-font">Select your role to access systems</h2>
              <p class="text-gray-700 text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-50">Authorized Personnel Only</p>
           </div>
        }
      }
    </div>
  `
})
export class DashboardComponent {
  store = inject(StoreService);
  
  // Admin Tabs
  adminTab = signal<'overview' | 'users' | 'moderation' | 'management'>('overview');

  // Management Forms State
  editingCompId = signal<string | null>(null);
  showCompModal = signal(false);
  showTitleModal = signal(false);

  newTitleName = '';
  newTitlePublisher = '';
  newTitleDesc = '';
  newTitleImage = '';
  newTitleLinks: {platform: string, url: string}[] = [];
  
  // Advanced Competition Form
  newCompName = '';
  newCompTitleId = '';
  newCompPrize = '';
  newCompFormat: TournamentFormat = 'single_elimination';
  newCompRoundRobinType: 'single' | 'double' = 'single';
  newCompRules: number = 3;
  newCompMaxTeams = 8;
  newCompMinPlayers = 5;
  newCompMaxPlayers = 7;
  newCompImage = '';
  newCompStartDate = new Date().toISOString().split('T')[0];
  newCompEndDate = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];
  newCompPlayDays: number[] = [5, 6, 0]; // Default Fri, Sat, Sun
  newCompStartTime = '20:00';
  newCompMatchesPerDay = 1;
  newCompRoundDuration = 15;
  
  // Rulebook Management
  ruleInputMode: 'manual' | 'json' = 'manual';
  newCompRulesList: CompetitionRule[] = [];
  newRuleCode = '';
  newRuleTitle = '';
  newRuleDesc = '';
  jsonRulesInput = '';

  selectedTeams: string[] = [];
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  // Match Input State for Players
  matchInputs: Record<string, number> = {};

  switchRole(role: string) {
    this.store.login(role as any);
  }

  // --- Helpers ---
  getTitleName(id: string) {
      const t = this.store.titles().find(x => x.id === id);
      return t ? t.name : 'Unknown';
  }

  getStatusColor(status: string) {
      switch(status) {
          case 'active': return 'text-green-400 border-green-500/30 bg-green-500/10';
          case 'upcoming': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
          case 'completed': return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
          case 'draft': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
          default: return 'text-white';
      }
  }

  // --- Modal Logic ---
  openCompetitionModal() {
      if (!this.editingCompId()) {
          this.resetCompForm();
      }
      this.showCompModal.set(true);
  }

  closeCompetitionModal() {
      this.showCompModal.set(false);
      this.editingCompId.set(null);
      this.resetCompForm();
  }

  openTitleModal() {
      this.newTitleName = '';
      this.newTitlePublisher = '';
      this.newTitleDesc = '';
      this.newTitleImage = '';
      this.newTitleLinks = [];
      this.showTitleModal.set(true);
  }

  closeTitleModal() {
      this.showTitleModal.set(false);
  }

  resetCompForm() {
      this.newCompName = '';
      this.newCompTitleId = '';
      this.newCompPrize = '';
      this.newCompFormat = 'single_elimination';
      this.newCompRoundRobinType = 'single';
      this.newCompRules = 3;
      this.newCompMaxTeams = 8;
      this.newCompMinPlayers = 5;
      this.newCompMaxPlayers = 7;
      this.newCompImage = '';
      this.newCompStartDate = new Date().toISOString().split('T')[0];
      this.newCompEndDate = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];
      this.newCompPlayDays = [5, 6, 0];
      this.newCompStartTime = '20:00';
      this.newCompMatchesPerDay = 1;
      this.newCompRoundDuration = 15;
      this.newCompRulesList = [];
      this.selectedTeams = [];
  }

  editCompetition(comp: Competition) {
      this.editingCompId.set(comp.id);
      this.newCompName = comp.name;
      this.newCompTitleId = comp.titleId;
      this.newCompPrize = comp.prizePool;
      this.newCompFormat = comp.format;
      this.newCompRoundRobinType = comp.roundRobinType || 'single';
      this.newCompRules = comp.matchRules;
      this.newCompMaxTeams = comp.maxTeams;
      this.newCompMinPlayers = comp.minPlayers;
      this.newCompMaxPlayers = comp.maxPlayers;
      this.newCompImage = comp.image;
      this.newCompStartDate = comp.startDate;
      this.newCompEndDate = comp.endDate;
      this.newCompPlayDays = comp.playDays;
      this.newCompStartTime = comp.startTime || '20:00';
      this.newCompMatchesPerDay = comp.matchesPerDay || 1;
      this.newCompRoundDuration = comp.roundDuration || 15;
      this.newCompRulesList = [...comp.rules];
      this.selectedTeams = comp.registeredTeams || [];
      
      this.showCompModal.set(true);
  }

  // --- Match Action ---
  tryGenerateMatches(comp: Competition) {
      if (!comp.registeredTeams || comp.registeredTeams.length < 2) {
          this.store.addNotification(`Team insufficienti (${comp.registeredTeams?.length || 0}/2). Iscrivi più team prima di generare.`, 'warning');
          return;
      }
      this.store.generateMatches(comp.id);
  }

  // --- Player Match Logic ---
  getMyTeamName() {
      const u = this.store.currentUser();
      if (!u || !u.teamId) {
          return u?.name === 'ProGamer_X' ? 'Neon Strikers' : '';
      }
      const team = this.store.teams().find(t => t.id === u.teamId);
      return team ? team.name : '';
  }

  isConfirmed(match: any): boolean {
      const myTeam = this.getMyTeamName();
      if (myTeam === match.teamA) return match.confirmedByA;
      if (myTeam === match.teamB) return match.confirmedByB;
      return false;
  }

  confirmMatch(match: any) {
    const scoreA = this.matchInputs[match.id + '_A'] || 0;
    const scoreB = this.matchInputs[match.id + '_B'] || 0;
    const myTeam = this.getMyTeamName();
    const side = myTeam === match.teamA ? 'A' : 'B';
    this.store.confirmMatchResult(match.id, side, scoreA, scoreB);
  }

  // --- Admin Management Logic ---

  addLink() {
     this.newTitleLinks.push({platform: '', url: ''});
  }

  removeLink(index: number) {
     this.newTitleLinks.splice(index, 1);
  }
  
  createTitle() {
      if (this.newTitleName && this.newTitlePublisher) {
          this.store.addTitle(
             this.newTitleName, 
             this.newTitlePublisher, 
             this.newTitleDesc, 
             this.newTitleImage,
             this.newTitleLinks.filter(l => l.platform && l.url)
          );
          this.closeTitleModal();
      }
  }

  deleteTitle(id: string) {
      if(confirm('Sei sicuro di voler eliminare questo gioco?')) {
          this.store.deleteTitle(id);
      }
  }

  editDraft(draft: Competition) {
      this.editCompetition(draft);
  }

  saveCompetition(isDraft: boolean) {
      const details = {
          startDate: this.newCompStartDate,
          endDate: this.newCompEndDate,
          format: this.newCompFormat,
          matchRules: this.newCompRules,
          playDays: this.newCompPlayDays,
          maxTeams: this.newCompMaxTeams,
          minPlayers: this.newCompMinPlayers,
          maxPlayers: this.newCompMaxPlayers,
          image: this.newCompImage,
          rules: this.newCompRulesList,
          roundRobinType: this.newCompRoundRobinType,
          startTime: this.newCompStartTime,
          matchesPerDay: this.newCompMatchesPerDay,
          roundDuration: this.newCompRoundDuration
      };

      if (this.editingCompId()) {
          this.store.updateCompetition(
              this.editingCompId()!,
              this.newCompName,
              this.newCompTitleId,
              this.newCompPrize,
              this.selectedTeams,
              isDraft,
              details
          );
      } else {
          this.store.createCompetition(
              this.newCompName,
              this.newCompTitleId,
              this.newCompPrize,
              this.selectedTeams,
              isDraft,
              details
          );
      }
      this.closeCompetitionModal();
  }

  toggleTeamSelection(teamId: string) {
      if (this.selectedTeams.includes(teamId)) {
          this.selectedTeams = this.selectedTeams.filter(id => id !== teamId);
      } else {
          if (this.selectedTeams.length < this.newCompMaxTeams) {
              this.selectedTeams.push(teamId);
          } else {
              this.store.addNotification(`Max team limit (${this.newCompMaxTeams}) raggiunto.`, 'warning');
          }
      }
  }

  toggleDay(dayIndex: number) {
      if (this.newCompPlayDays.includes(dayIndex)) {
          this.newCompPlayDays = this.newCompPlayDays.filter(d => d !== dayIndex);
      } else {
          this.newCompPlayDays.push(dayIndex);
      }
  }

  // --- Rulebook Logic ---
  addRule() {
      if (this.newRuleCode && this.newRuleTitle && this.newRuleDesc) {
          this.newCompRulesList.push({
              code: this.newRuleCode,
              title: this.newRuleTitle,
              description: this.newRuleDesc
          });
          this.newRuleCode = '';
          this.newRuleTitle = '';
          this.newRuleDesc = '';
      }
  }

  removeRule(index: number) {
      this.newCompRulesList.splice(index, 1);
  }

  parseJsonRules() {
      try {
          const parsed = JSON.parse(this.jsonRulesInput);
          if (Array.isArray(parsed)) {
              this.newCompRulesList = [...this.newCompRulesList, ...parsed];
              this.store.addNotification('JSON Rules imported successfully', 'success');
              this.jsonRulesInput = '';
          } else {
              this.store.addNotification('Invalid JSON: Must be an array', 'error');
          }
      } catch (e) {
          this.store.addNotification('Invalid JSON syntax', 'error');
      }
  }
  
  assignCaster(id: string) { this.store.assignCaster(id); }
  banUser(id: string) { this.store.banUser(id); }
  deleteReview(id: string) { this.store.deleteReview(id); }
  deleteCompetition(id: string) { this.store.deleteCompetition(id); }
}
