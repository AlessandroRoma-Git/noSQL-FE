import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, UserRole, User, Review, TournamentFormat, CompetitionRule, Competition } from '../services/store.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen pt-10 px-6 max-w-7xl mx-auto pb-20">
      
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 class="text-4xl gaming-font text-white mb-2">
            DASHBOARD
          </h1>
          <p class="text-gray-500 font-light">Welcome back, <span class="text-white font-medium">{{ store.currentUser()?.name }}</span></p>
        </div>
        
        <div class="px-4 py-2 bg-white/5 rounded-lg border border-white/5 backdrop-blur-sm text-xs text-gray-400">
           Logged in as <span class="text-cyan-400 font-bold uppercase">{{ store.currentUser()?.role }}</span>
        </div>
      </div>

      <!-- Content based on Role -->
      @switch (store.currentUser()?.role) {
        
        <!-- ADMIN VIEW -->
        @case ('admin') {
          <!-- Admin Tabs -->
          <div class="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
             <button (click)="adminTab.set('overview')" [class.text-cyan-400]="adminTab() === 'overview'" class="text-gray-400 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">Overview</button>
             <button (click)="adminTab.set('management')" [class.text-cyan-400]="adminTab() === 'management'" class="text-gray-400 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">Tornei & Giochi</button>
             <button (click)="adminTab.set('users')" [class.text-cyan-400]="adminTab() === 'users'" class="text-gray-400 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">Gestione Utenti</button>
             <button (click)="adminTab.set('moderation')" [class.text-cyan-400]="adminTab() === 'moderation'" class="text-gray-400 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">Moderazione</button>
          </div>

          @if (adminTab() === 'overview') {
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
               <!-- Stats Widgets -->
               <div class="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between h-32">
                     <div class="text-gray-500 text-xs uppercase font-bold tracking-widest">Utenti</div>
                     <div class="text-4xl font-mono text-white">{{ store.users().length }}</div>
                  </div>
                  <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between h-32">
                     <div class="text-gray-500 text-xs uppercase font-bold tracking-widest">Tornei</div>
                     <div class="text-4xl font-mono text-cyan-400">{{ store.competitions().length }}</div>
                  </div>
                  <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between h-32">
                     <div class="text-gray-500 text-xs uppercase font-bold tracking-widest">Reports</div>
                     <div class="text-4xl font-mono text-red-400">23</div>
                  </div>
                  <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between h-32 bg-gradient-to-br from-white/5 to-transparent">
                     <div class="text-gray-500 text-xs uppercase font-bold tracking-widest">Revenue</div>
                     <div class="text-4xl font-mono text-green-400">$45k</div>
                  </div>
               </div>

               <div class="lg:col-span-3 glass-panel rounded-2xl p-8 border border-white/5">
                 <h3 class="text-lg font-bold text-white mb-6">Activity Log</h3>
                 <div class="space-y-4">
                    <div class="flex items-center justify-between py-2 border-b border-white/5">
                       <span class="text-sm text-gray-300">Admin1 banned User_99</span>
                       <span class="text-xs text-gray-600 font-mono">2m ago</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-white/5">
                       <span class="text-sm text-gray-300">New Tournament "Apex Legends Winter" created</span>
                       <span class="text-xs text-gray-600 font-mono">1h ago</span>
                    </div>
                 </div>
               </div>
               
               <div class="glass-panel rounded-2xl p-8 border border-white/5">
                  <h3 class="text-lg font-bold text-white mb-6">Quick Actions</h3>
                  <div class="flex flex-col gap-3">
                    <button (click)="adminTab.set('management')" class="w-full py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-sm font-bold transition">Create Tournament</button>
                    <button class="w-full py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-bold transition">Ban Hammer</button>
                  </div>
               </div>
            </div>
          }

          @if (adminTab() === 'management') {
             <div class="space-y-8">
                <!-- Competitions Section -->
                <div class="glass-panel p-6 rounded-2xl">
                   <div class="flex justify-between items-center mb-6">
                      <h3 class="text-xl font-bold text-white">Gestione Tornei</h3>
                      <button (click)="openCompetitionModal()" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]">
                         + AGGIUNGI TORNEO
                      </button>
                   </div>
                   <!-- Competitions Table -->
                   <div class="overflow-x-auto">
                      <table class="w-full text-left text-sm text-gray-400">
                         <thead class="bg-white/5 text-xs uppercase font-bold text-gray-300">
                            <tr>
                               <th class="px-4 py-3">Nome</th>
                               <th class="px-4 py-3">Gioco</th>
                               <th class="px-4 py-3">Stato</th>
                               <th class="px-4 py-3">Date</th>
                               <th class="px-4 py-3 text-right">Azioni</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-white/5">
                            @for (comp of store.competitions(); track comp.id) {
                               <tr class="hover:bg-white/5 transition-colors">
                                  <td class="px-4 py-3 font-medium text-white">{{ comp.name }}</td>
                                  <td class="px-4 py-3">{{ getTitleName(comp.titleId) }}</td>
                                  <td class="px-4 py-3">
                                     <span [class]="getStatusColor(comp.status)" class="px-2 py-1 rounded text-[10px] font-bold uppercase border">
                                        {{ comp.status }}
                                     </span>
                                  </td>
                                  <td class="px-4 py-3 text-xs">{{ comp.startDate | date:'shortDate' }} - {{ comp.endDate | date:'shortDate' }}</td>
                                  <td class="px-4 py-3 text-right flex justify-end gap-2">
                                     <a [routerLink]="['/app/competitions', comp.id]" class="text-white hover:text-cyan-400 font-bold text-xs flex items-center px-2 py-1 bg-white/10 rounded border border-white/10 hover:border-cyan-500/50 transition-all mr-2">
                                        VIEW
                                     </a>
                                     <button (click)="editCompetition(comp)" class="text-cyan-400 hover:text-white font-bold text-xs">EDIT</button>
                                     <button (click)="deleteCompetition(comp.id)" class="text-red-500 hover:text-white font-bold text-xs">DELETE</button>
                                  </td>
                               </tr>
                            }
                         </tbody>
                      </table>
                   </div>
                </div>
          
                <!-- Titles Section -->
                <div class="glass-panel p-6 rounded-2xl">
                   <div class="flex justify-between items-center mb-6">
                      <h3 class="text-xl font-bold text-white">Gestione Giochi (Titoli)</h3>
                      <button (click)="openTitleModal()" class="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(192,38,211,0.4)]">
                         + AGGIUNGI GIOCO
                      </button>
                   </div>
                   <!-- Titles Table -->
                   <div class="overflow-x-auto">
                      <table class="w-full text-left text-sm text-gray-400">
                         <thead class="bg-white/5 text-xs uppercase font-bold text-gray-300">
                            <tr>
                               <th class="px-4 py-3">Cover</th>
                               <th class="px-4 py-3">Nome</th>
                               <th class="px-4 py-3">Publisher</th>
                               <th class="px-4 py-3 text-right">Azioni</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-white/5">
                            @for (title of store.titles(); track title.id) {
                               <tr class="hover:bg-white/5 transition-colors">
                                  <td class="px-4 py-3">
                                     <img [src]="title.image" class="w-12 h-8 object-cover rounded border border-white/10">
                                  </td>
                                  <td class="px-4 py-3 font-medium text-white">{{ title.name }}</td>
                                  <td class="px-4 py-3">{{ title.publisher }}</td>
                                  <td class="px-4 py-3 text-right">
                                     <button (click)="deleteTitle(title.id)" class="text-red-500 hover:text-white font-bold text-xs">DELETE</button>
                                  </td>
                               </tr>
                            }
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          }

          <!-- MODALS -->
          @if (showCompModal()) {
             <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div class="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl p-8 relative">
                   <button (click)="closeCompetitionModal()" class="absolute top-4 right-4 text-gray-500 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                   
                   <h3 class="text-2xl font-bold text-white mb-8 border-l-4 border-cyan-500 pl-3">
                      {{ editingCompId() ? 'Modifica Torneo' : 'Crea Nuovo Torneo' }}
                   </h3>
                   
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <!-- Basic Info -->
                      <div class="space-y-4">
                         <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Informazioni Base</h4>
                         <div>
                            <label class="text-xs text-gray-500 uppercase font-bold block mb-2">
                                Nome Torneo <span class="text-red-500">*</span>
                            </label>
                            <input type="text" [(ngModel)]="newCompName" placeholder="Es. Winter Championship 2024" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                         </div>
                         <div>
                            <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Immagine Copertina (URL)</label>
                            <input type="text" [(ngModel)]="newCompImage" placeholder="https://example.com/banner.jpg" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                         </div>
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                               <label class="text-xs text-gray-500 uppercase font-bold block mb-2">
                                   Gioco <span class="text-red-500">*</span>
                               </label>
                               <select [(ngModel)]="newCompTitleId" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                                  <option value="" disabled selected>Seleziona Gioco</option>
                                  <option *ngFor="let t of store.titles()" [value]="t.id">{{ t.name }}</option>
                               </select>
                            </div>
                            <div>
                               <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Prize Pool</label>
                               <input type="text" [(ngModel)]="newCompPrize" placeholder="$1000" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                            </div>
                         </div>
                      </div>

                      <!-- Rules & Format -->
                      <div class="space-y-4">
                         <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Regole & Formato</h4>
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                               <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Formato</label>
                               <select [(ngModel)]="newCompFormat" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                                  <option value="single_elimination">Single Elimination</option>
                                  <option value="double_elimination">Double Elimination</option>
                                  <option value="round_robin">Round Robin (Girone)</option>
                                  <option value="swiss">Swiss System</option>
                               </select>
                            </div>
                            @if (newCompFormat === 'round_robin') {
                               <div>
                                  <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Tipologia Girone</label>
                                  <select [(ngModel)]="newCompRoundRobinType" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                                     <option value="single">Solo Andata</option>
                                     <option value="double">Andata e Ritorno</option>
                                  </select>
                               </div>
                            }
                            <div>
                               <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Match Rules (Best Of)</label>
                               <input type="number" [(ngModel)]="newCompRules" placeholder="e.g. 3 for BO3" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                            </div>
                         </div>
                         <div>
                            <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Max Team Slots</label>
                            <input type="number" [(ngModel)]="newCompMaxTeams" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                         </div>
                         <div class="grid grid-cols-2 gap-4">
                           <div>
                              <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Min Players/Team</label>
                              <input type="number" [(ngModel)]="newCompMinPlayers" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                           </div>
                           <div>
                              <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Max Players/Team</label>
                              <input type="number" [(ngModel)]="newCompMaxPlayers" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                           </div>
                         </div>
                      </div>
                   </div>

                   <!-- RULEBOOK SECTION -->
                   <div class="mt-8 space-y-4">
                      <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Regolamento (Rulebook)</h4>
                      
                      <div class="flex gap-4 mb-4">
                          <button (click)="ruleInputMode = 'manual'" [class.bg-white]="ruleInputMode === 'manual'" [class.text-black]="ruleInputMode === 'manual'" class="px-4 py-2 rounded text-xs font-bold border border-white/10 text-gray-400 hover:text-white transition-colors">Manual Entry</button>
                          <button (click)="ruleInputMode = 'json'" [class.bg-white]="ruleInputMode === 'json'" [class.text-black]="ruleInputMode === 'json'" class="px-4 py-2 rounded text-xs font-bold border border-white/10 text-gray-400 hover:text-white transition-colors">JSON Import</button>
                      </div>

                      <!-- Manual Mode -->
                      @if (ruleInputMode === 'manual') {
                         <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                            <div class="md:col-span-1">
                               <input type="text" [(ngModel)]="newRuleCode" placeholder="Code (e.g. 1.1)" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs">
                            </div>
                            <div class="md:col-span-1">
                               <input type="text" [(ngModel)]="newRuleTitle" placeholder="Title (e.g. Conduct)" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs">
                            </div>
                            <div class="md:col-span-2 flex gap-2">
                               <input type="text" [(ngModel)]="newRuleDesc" placeholder="Description..." class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs">
                               <button (click)="addRule()" class="px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs">ADD</button>
                            </div>
                         </div>
                      }

                      <!-- JSON Mode -->
                      @if (ruleInputMode === 'json') {
                         <div class="p-4 bg-black/20 rounded-xl border border-white/5">
                             <textarea [(ngModel)]="jsonRulesInput" rows="4" placeholder='[{"code": "1.0", "title": "Example", "description": "Text..."}]' class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-xs mb-2"></textarea>
                             <button (click)="parseJsonRules()" class="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-xs">PARSE JSON</button>
                         </div>
                      }

                      <!-- Rule List Preview -->
                      @if (newCompRulesList.length > 0) {
                         <div class="mt-4 space-y-2 max-h-40 overflow-y-auto bg-black/20 p-2 rounded-lg">
                            <div *ngFor="let r of newCompRulesList; let i = index" class="flex justify-between items-start p-2 hover:bg-white/5 rounded">
                               <div class="text-xs text-gray-300">
                                  <span class="text-cyan-400 font-bold mr-2">{{ r.code }}</span>
                                  <span class="font-bold text-white mr-2">{{ r.title }}</span>
                                  <span class="text-gray-500 italic">{{ r.description }}</span>
                               </div>
                               <button (click)="removeRule(i)" class="text-red-500 hover:text-white text-xs font-bold">×</button>
                            </div>
                         </div>
                      }
                   </div>

                   <!-- Schedule Settings -->
                   <div class="mt-8 space-y-4">
                      <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Pianificazione Calendario</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                               <label class="text-xs text-gray-500 uppercase font-bold block mb-2">
                                   Data Inizio <span class="text-red-500">*</span>
                               </label>
                               <input type="date" [(ngModel)]="newCompStartDate" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                            </div>
                            <div>
                               <label class="text-xs text-gray-500 uppercase font-bold block mb-2">
                                   Data Fine <span class="text-red-500">*</span>
                               </label>
                               <input type="date" [(ngModel)]="newCompEndDate" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                            </div>
                         </div>
                         
                         <div>
                            <label class="text-xs text-gray-500 uppercase font-bold block mb-2">
                                Giorni di Gioco <span class="text-red-500">*</span>
                            </label>
                            <div class="flex flex-wrap gap-2">
                               <button *ngFor="let day of daysOfWeek; let i = index" 
                                  (click)="toggleDay(i)"
                                  [class.bg-cyan-600]="newCompPlayDays.includes(i)"
                                  [class.text-white]="newCompPlayDays.includes(i)"
                                  [class.bg-white/5]="!newCompPlayDays.includes(i)"
                                  class="w-10 h-10 rounded-lg text-xs font-bold transition-all border border-white/10 hover:border-white/30">
                                  {{ day }}
                               </button>
                            </div>
                         </div>
                         
                         <div class="grid grid-cols-3 gap-4">
                             <div>
                                 <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Orario Inizio</label>
                                 <input type="time" [(ngModel)]="newCompStartTime" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                             </div>
                             <div>
                                 <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Match per Giorno</label>
                                 <input type="number" [(ngModel)]="newCompMatchesPerDay" min="1" max="10" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                             </div>
                             <div>
                                 <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Durata Round (min)</label>
                                 <input type="number" [(ngModel)]="newCompRoundDuration" min="5" step="5" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                                 <div class="text-[10px] text-gray-500 mt-1">
                                     Match Totale: <span class="text-cyan-400 font-bold">{{ newCompRoundDuration * newCompRules }} min</span>
                                 </div>
                             </div>
                         </div>
                      </div>
                   </div>

                   <!-- Team Selection -->
                   <div class="mt-8">
                      <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Pre-registra Team ({{ selectedTeams.length }} / {{ newCompMaxTeams }})</label>
                      <div class="h-40 overflow-y-auto bg-black/40 border border-white/10 rounded-lg p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                         <div *ngFor="let team of store.teams()" 
                              (click)="toggleTeamSelection(team.id)"
                              [class.bg-cyan-900]="selectedTeams.includes(team.id)"
                              class="p-2 rounded cursor-pointer hover:bg-white/5 text-sm text-white flex justify-between items-center border border-transparent hover:border-white/20">
                            <span class="truncate">{{ team.name }}</span>
                            <span *ngIf="selectedTeams.includes(team.id)" class="text-cyan-400 font-bold">✓</span>
                         </div>
                      </div>
                      <div class="text-[10px] text-gray-500 mt-2">
                         * Il calendario verrà generato automaticamente in base ai giorni selezionati e al formato.
                         Se i team selezionati sono meno del max, verranno creati slot vuoti (TBD).
                      </div>
                   </div>

                   <div class="mt-8 pt-6 border-t border-white/10 flex justify-end gap-4">
                      <button (click)="saveCompetition(true)" class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl uppercase tracking-widest transition-all">
                         Salva come Bozza
                      </button>
                      <button (click)="saveCompetition(false)" class="px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                         Pubblica Ora
                      </button>
                   </div>
                </div>
             </div>
          }

          @if (showTitleModal()) {
             <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div class="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl p-8 relative">
                   <button (click)="closeTitleModal()" class="absolute top-4 right-4 text-gray-500 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>

                   <h3 class="text-xl font-bold text-white mb-6 border-l-2 border-fuchsia-500 pl-3">Aggiungi Nuovo Gioco (Titolo)</h3>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <!-- Left: Info -->
                      <div class="space-y-4">
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                              <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Nome Gioco</label>
                              <input type="text" [(ngModel)]="newTitleName" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                            </div>
                            <div>
                              <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Publisher</label>
                              <input type="text" [(ngModel)]="newTitlePublisher" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                            </div>
                         </div>
                         <div>
                            <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Immagine (URL)</label>
                            <input type="text" [(ngModel)]="newTitleImage" placeholder="https://..." class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none">
                         </div>
                         <div>
                            <label class="text-xs text-gray-500 uppercase font-bold block mb-2">Descrizione</label>
                            <textarea [(ngModel)]="newTitleDesc" rows="3" class="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-fuchsia-500 focus:outline-none"></textarea>
                         </div>
                      </div>

                      <!-- Right: Links -->
                      <div>
                          <div class="flex justify-between items-center mb-2">
                             <label class="text-xs text-gray-500 uppercase font-bold">Download Links</label>
                             <button (click)="addLink()" class="text-xs text-cyan-400 hover:text-white font-bold">+ ADD LINK</button>
                          </div>
                          
                          <div class="space-y-2 bg-black/20 p-2 rounded-lg border border-white/5 min-h-[100px]">
                             <div *ngFor="let link of newTitleLinks; let i = index" class="flex gap-2">
                                <input type="text" [(ngModel)]="link.platform" placeholder="Platform (e.g. Steam)" class="w-1/3 bg-black/40 border border-white/10 rounded p-2 text-xs text-white">
                                <input type="text" [(ngModel)]="link.url" placeholder="URL" class="flex-grow bg-black/40 border border-white/10 rounded p-2 text-xs text-white">
                                <button (click)="removeLink(i)" class="text-red-500 hover:text-white px-2">×</button>
                             </div>
                             @if(newTitleLinks.length === 0) {
                                <div class="text-center text-gray-600 text-xs py-4">No download links added.</div>
                             }
                          </div>
                      </div>
                      
                      <div class="md:col-span-2 flex justify-end mt-4">
                         <button (click)="createTitle()" class="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg uppercase tracking-widest transition-colors shadow-lg shadow-fuchsia-900/20">Aggiungi Titolo</button>
                      </div>
                   </div>
                </div>
             </div>
          }

          @if (adminTab() === 'users') {
            <div class="glass-panel rounded-2xl overflow-hidden">
               <div class="p-6 border-b border-white/10 flex justify-between items-center">
                  <h3 class="text-lg font-bold text-white">Elenco Utenti</h3>
                  <div class="text-xs text-gray-500 font-mono">Total: {{ store.users().length }}</div>
               </div>
               <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-gray-400">
                     <thead class="bg-white/5 text-xs uppercase font-bold text-gray-300">
                        <tr>
                           <th class="px-6 py-4">User</th>
                           <th class="px-6 py-4">Role</th>
                           <th class="px-6 py-4">Status</th>
                           <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-white/5">
                        @for (u of store.users(); track u.id) {
                           <tr class="hover:bg-white/5 transition-colors">
                              <td class="px-6 py-4 flex items-center gap-3">
                                 <img [src]="u.avatar" class="w-8 h-8 rounded-full bg-gray-700">
                                 <span class="text-white font-medium">{{ u.name }}</span>
                              </td>
                              <td class="px-6 py-4">
                                 <span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-white/10 border border-white/10">{{ u.role }}</span>
                              </td>
                              <td class="px-6 py-4">
                                 <span [class]="u.status === 'banned' ? 'text-red-500' : 'text-green-400'" class="text-xs uppercase font-bold">● {{ u.status }}</span>
                              </td>
                              <td class="px-6 py-4 text-right">
                                 @if (u.status !== 'banned') {
                                    <button (click)="banUser(u.id)" class="text-red-500 hover:text-white font-bold text-xs">BAN</button>
                                 } @else {
                                    <span class="text-gray-600 text-xs italic">Banned</span>
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
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (review of store.reviews(); track review.id) {
                   <div class="glass-panel p-6 rounded-2xl flex gap-4">
                      <img [src]="review.avatar" class="w-12 h-12 rounded-full bg-gray-700">
                      <div class="flex-grow">
                         <div class="flex justify-between items-start mb-2">
                            <div>
                               <div class="font-bold text-white">{{ review.authorName }}</div>
                               <div class="text-xs text-gray-500">To Caster: {{ review.casterId }}</div>
                            </div>
                            <div class="text-yellow-400 text-xs">★ {{ review.rating }}</div>
                         </div>
                         <p class="text-gray-300 text-sm mb-4 bg-white/5 p-3 rounded-lg border border-white/5">"{{ review.comment }}"</p>
                         <div class="flex justify-end gap-3">
                            <button (click)="deleteReview(review.id)" class="px-4 py-2 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold uppercase">Delete</button>
                         </div>
                      </div>
                   </div>
                }
                @if (store.reviews().length === 0) {
                   <div class="col-span-2 text-center text-gray-500 py-10">All reviews are clean.</div>
                }
             </div>
          }
        }

        <!-- MODERATOR VIEW -->
        @case ('moderator') {
           <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2">
                 <h2 class="text-xl font-bold text-white mb-6 pl-2 border-l-2 border-orange-500">Manage Competitions</h2>
                 <div class="space-y-4">
                    @for (comp of store.competitions(); track comp.id) {
                       <div class="glass-panel p-4 rounded-xl flex items-center justify-between">
                          <div class="flex items-center gap-4">
                             <img [src]="comp.image" class="w-16 h-10 rounded object-cover">
                             <div>
                                <div class="font-bold text-white">{{ comp.name }}</div>
                                <div class="text-xs text-gray-500 uppercase">{{ comp.status }}</div>
                             </div>
                          </div>
                          <div class="flex gap-2">
                             <button class="px-3 py-1 bg-white/5 text-gray-300 hover:text-white rounded text-xs font-bold">EDIT</button>
                             <button (click)="deleteCompetition(comp.id)" class="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded text-xs font-bold">DELETE</button>
                          </div>
                       </div>
                    }
                 </div>
              </div>

              <div>
                 <h2 class="text-xl font-bold text-white mb-6 pl-2 border-l-2 border-red-500">Reported Content</h2>
                 <div class="glass-panel p-4 rounded-xl text-center">
                    <div class="text-3xl font-mono text-white mb-2">{{ store.reviews().length }}</div>
                    <div class="text-xs text-gray-500 uppercase tracking-widest">Active Reports</div>
                    <button (click)="adminTab.set('moderation'); switchRole('admin')" class="mt-4 w-full py-2 bg-red-500 text-white rounded font-bold text-sm">REVIEW ALL</button>
                 </div>
              </div>
           </div>
        }

        <!-- PLAYER VIEW (No Changes) -->
        @case ('player') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Profile Card -->
            <div class="lg:col-span-1 space-y-6">
               <div class="glass-panel p-8 rounded-3xl text-center relative overflow-hidden group">
                  <div class="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-50"></div>
                  
                  <div class="relative z-10">
                    <img [src]="store.currentUser()?.avatar" class="w-28 h-28 rounded-full mx-auto border-4 border-white/10 mb-6 object-cover shadow-2xl">
                    <h2 class="text-3xl font-bold text-white mb-1">{{ store.currentUser()?.name }}</h2>
                    <p class="text-cyan-400 text-sm font-medium mb-8">Team: {{ getMyTeamName() || 'No Team' }}</p>
                    
                    <div class="grid grid-cols-2 gap-4 mb-8">
                      <div class="bg-black/30 rounded-xl p-3">
                        <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ELO</div>
                        <div class="text-2xl font-mono text-white">{{ store.currentUser()?.elo }}</div>
                      </div>
                      <div class="bg-black/30 rounded-xl p-3">
                        <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Winrate</div>
                        <div class="text-2xl font-mono text-green-400">68%</div>
                      </div>
                    </div>
                    
                    @if(store.currentUser()?.teamId) {
                      <button [routerLink]="['/app/teams', store.currentUser()?.teamId]" class="w-full py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition-transform">TEAM PROFILE</button>
                    } @else {
                      <button routerLink="/app/teams" class="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold hover:scale-105 transition-transform animate-pulse">FIND TEAM</button>
                    }
                  </div>
               </div>

               <!-- CAPTAIN AREA: PENDING REQUESTS -->
               @if (store.myTeamRequests().length > 0) {
                   <div class="glass-panel p-6 rounded-2xl border border-yellow-500/20">
                       <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                           <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                           Join Requests
                       </h3>
                       <div class="space-y-4">
                           @for (req of store.myTeamRequests(); track req.id) {
                               <div class="bg-white/5 p-4 rounded-xl">
                                   <div class="flex items-center gap-3 mb-3">
                                       <img [src]="req.userAvatar" class="w-10 h-10 rounded-full">
                                       <div>
                                           <div class="font-bold text-white text-sm">{{ req.userName }}</div>
                                           <div class="text-[10px] text-gray-500 uppercase">Wants to join</div>
                                       </div>
                                   </div>
                                   <div class="flex gap-2">
                                       <button (click)="store.respondToRequest(req.id, true)" class="flex-1 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 text-xs font-bold rounded">ACCEPT</button>
                                       <button (click)="store.respondToRequest(req.id, false)" class="flex-1 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-bold rounded">REJECT</button>
                                   </div>
                               </div>
                           }
                       </div>
                   </div>
               }
            </div>

            <!-- Matches Section -->
            <div class="lg:col-span-2 space-y-6">
               <h3 class="text-xl font-bold text-white pl-2 border-l-2 border-cyan-500">Upcoming Matches</h3>
               
               @if (store.myMatches().length === 0) {
                 <div class="p-8 rounded-2xl border border-dashed border-white/10 text-center text-gray-500">
                   No matches scheduled.
                 </div>
               }

               @for (match of store.myMatches(); track match.id) {
                 <div class="glass-panel rounded-2xl p-6 flex flex-col items-center gap-6 hover:bg-white/5 transition-colors group">
                    <div class="flex items-center gap-6 w-full justify-between">
                       <div class="flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-xl border border-white/5 shrink-0">
                         <span class="text-[10px] text-gray-500 font-bold uppercase">Nov</span>
                         <span class="text-xl font-bold text-white">20</span>
                       </div>
                       
                       <div class="flex flex-col md:flex-row items-center gap-4 flex-grow justify-center">
                          <span class="font-bold text-lg" [class.text-cyan-400]="match.teamA === getMyTeamName()">{{ match.teamA }}</span>
                          <span class="text-xs text-gray-600 bg-black/20 px-2 py-1 rounded">VS</span>
                          <span class="font-bold text-lg" [class.text-cyan-400]="match.teamB === getMyTeamName()">{{ match.teamB }}</span>
                       </div>

                       <div class="w-16">
                           <!-- Spacer for layout balance -->
                       </div>
                    </div>

                    @if (match.status === 'scheduled' || match.status === 'live') {
                       <div class="w-full bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                           <div class="text-xs text-gray-500 uppercase font-bold">Captains Area</div>
                           
                           @if (!isConfirmed(match)) {
                              <div class="flex items-center gap-3">
                                <div class="flex items-center gap-2">
                                    <input type="number" [(ngModel)]="matchInputs[match.id + '_A']" placeholder="0" class="w-12 text-center bg-white/10 rounded p-1 text-white border border-white/10">
                                    <span class="text-gray-500">:</span>
                                    <input type="number" [(ngModel)]="matchInputs[match.id + '_B']" placeholder="0" class="w-12 text-center bg-white/10 rounded p-1 text-white border border-white/10">
                                </div>
                                <button (click)="confirmMatch(match)" class="px-5 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm font-bold whitespace-nowrap transition-colors">
                                  Confirm Score
                                </button>
                              </div>
                           } @else {
                              <span class="text-green-500 text-sm font-medium flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span> Confirmed by you
                              </span>
                           }
                       </div>
                    } @else if (match.status === 'disputed') {
                        <div class="w-full bg-red-500/10 border border-red-500/20 p-2 text-center text-red-400 text-sm rounded font-bold">
                            DISPUTED: Score mismatch
                        </div>
                    }
                 </div>
               }
            </div>
          </div>
        }

        <!-- CASTER VIEW (No Changes) -->
        @case ('caster') {
           <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="glass-panel rounded-3xl p-8 lg:col-span-1 h-fit">
                 <h3 class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Performance</h3>
                 <div class="flex items-end gap-2 mb-8">
                    <div class="text-6xl font-bold text-white leading-none">4.8</div>
                    <div class="text-yellow-400 text-xl mb-1">★★★★★</div>
                 </div>
                 
                 <div class="space-y-4">
                    <div class="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div class="text-xs text-gray-500 mb-1">Total Casts</div>
                        <div class="text-xl font-bold text-white">124</div>
                    </div>
                    
                    <div>
                       <div class="text-xs text-gray-500 mb-2">Badges</div>
                       <div class="flex flex-wrap gap-2">
                          <span class="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded uppercase">Voice of God</span>
                          <span class="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-bold rounded uppercase">Veteran</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="lg:col-span-2">
                 <h3 class="text-xl font-bold text-white pl-2 border-l-2 border-fuchsia-500 mb-6">Open Casting Slots</h3>
                 <div class="space-y-4">
                    @for (match of store.availableCasts(); track match.id) {
                       <div class="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-fuchsia-500/30 transition-all">
                          <div>
                             <div class="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider mb-1">Cyber Cup</div>
                             <div class="text-xl font-bold text-white">{{ match.teamA }} <span class="text-gray-600 px-1">vs</span> {{ match.teamB }}</div>
                             <div class="text-xs text-gray-500 mt-1">{{ match.date }}</div>
                          </div>
                          <button (click)="assignToMe(match.id)" class="px-6 py-2 rounded-lg bg-fuchsia-600 text-white font-bold hover:bg-fuchsia-500 shadow-lg shadow-fuchsia-900/20 transition-all">
                             CLAIM
                          </button>
                       </div>
                    }
                    @if (store.availableCasts().length === 0) {
                      <div class="text-center text-gray-500 py-10">No matches available.</div>
                    }
                 </div>
              </div>
           </div>
        }

        <!-- FAN AND SPONSOR VIEWS OMITTED FOR BREVITY AS THEY DONT CHANGE -->
        @default {
           <!-- Default Fan View kept simple in this update for focus on Admin -->
           <div class="text-center py-32">
              <h2 class="text-2xl text-gray-500 font-light">Select a role to view dashboard</h2>
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
      // Reset form if not editing
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
  
  assignToMe(id: string) { this.store.assignCaster(id); }
  banUser(id: string) { this.store.banUser(id); }
  deleteReview(id: string) { this.store.deleteReview(id); }
  deleteCompetition(id: string) { this.store.deleteCompetition(id); }
}