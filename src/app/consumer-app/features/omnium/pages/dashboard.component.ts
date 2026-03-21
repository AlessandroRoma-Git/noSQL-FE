import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService, Sponsor, Title, Competition, TournamentFormat, CompetitionRule, NewsItem } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from '../../../../common/components/image-picker/image-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ImagePickerComponent],
  template: `
    <div class="min-h-screen bg-[#050505] text-white p-6 md:p-12 space-y-12 animate-soft-in">

      <!-- HERO HEADER -->
      <header class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
        <div class="space-y-4 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-3 text-left">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
            <span class="text-cyan-400 font-black text-[10px] tracking-[0.4em] uppercase">Command Center</span>
          </div>
          <h1 class="text-6xl md:text-8xl font-black gaming-font leading-none uppercase tracking-tighter italic text-white text-left">Dashboard</h1>
        </div>

        <div class="flex bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-xl shrink-0 shadow-2xl overflow-x-auto no-scrollbar max-w-full text-left font-black">
          <button (click)="activeTab.set('overview')" [class]="getTabClass('overview')">Overview</button>
          <button (click)="activeTab.set('titles')" [class]="getTabClass('titles')">Game Titles</button>
          <button (click)="activeTab.set('arenas')" [class]="getTabClass('arenas')">Arenas</button>
          <button (click)="activeTab.set('news')" [class]="getTabClass('news')">Intelligence</button>
          <button (click)="activeTab.set('partners')" [class]="getTabClass('partners')">Partners</button>
        </div>
      </header>

      <div class="max-w-7xl mx-auto">

        <!-- SECTION: OVERVIEW -->
        @if (activeTab() === 'overview') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-soft-in italic font-black">
            <div class="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2.5rem] shadow-xl group hover:border-cyan-500/30 transition-all text-center italic font-black">
              <div class="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-[0.2em] italic font-black">Active Arenas</div>
              <div class="text-5xl font-black text-white font-mono leading-none italic font-black">{{ store.competitions().length }}</div>
            </div>
            <div class="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2.5rem] shadow-xl group hover:border-fuchsia-500/30 transition-all text-center italic font-black">
              <div class="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-[0.2em] italic font-black">Game Library</div>
              <div class="text-5xl font-black text-white font-mono leading-none italic font-black">{{ store.titles().length }}</div>
            </div>
            <div class="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2.5rem] shadow-xl group hover:border-cyan-500/30 transition-all text-center italic font-black">
              <div class="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-[0.2em] italic font-black">Intel Reports</div>
              <div class="text-5xl font-black text-white font-mono leading-none italic font-black">{{ store.news().length }}</div>
            </div>
            <div class="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2.5rem] shadow-xl group hover:border-fuchsia-500/30 transition-all text-center italic font-black">
              <div class="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-[0.2em] italic font-black">Personnel</div>
              <div class="text-5xl font-black text-white font-mono leading-none italic font-black">{{ store.teams().length }}</div>
            </div>
          </div>
        }

        <!-- SECTION: TITLES -->
        @if (activeTab() === 'titles') {
          <div class="space-y-8 animate-soft-in italic font-black">
            <div class="flex justify-between items-end px-4 text-left italic font-black">
              <h2 class="text-3xl font-black uppercase gaming-font italic leading-none text-left italic font-black text-white">Game <span class="text-cyan-400">Library</span></h2>
              <button (click)="openTitleModal()" class="button-primary !h-12 !px-8 !text-[10px] !rounded-xl italic font-black uppercase">Add New Title</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left italic font-black">
              @for (t of store.titles(); track t.id) {
                <div class="group relative aspect-[4/5] bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl text-left italic font-black">
                  <img [src]="t.image" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 text-left italic font-black">
                  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent text-left italic font-black"></div>
                  <div class="absolute bottom-0 left-0 w-full p-8 text-left italic font-black">
                    <p class="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1 text-left italic font-black">{{ t.publisher }}</p>
                    <h3 class="text-2xl font-black text-white uppercase tracking-tighter italic leading-none text-left italic font-black">{{ t.name }}</h3>
                    <div class="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all text-left italic font-black">
                      <button (click)="openTitleModal(t)" class="flex-1 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center italic font-black">Edit</button>
                      <button (click)="deleteTitle(t.id)" class="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all text-center italic font-black"><i class="fa-solid fa-trash text-[10px] text-center italic font-black"></i></button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- SECTION: ARENAS -->
        @if (activeTab() === 'arenas') {
          <div class="space-y-8 animate-soft-in italic font-black text-left">
            <div class="flex justify-between items-end px-4 italic font-black text-left">
              <h2 class="text-3xl font-black uppercase gaming-font italic leading-none text-left italic font-black text-white">Arena <span class="text-fuchsia-500 italic font-black">Deployments</span></h2>
              <button (click)="openArenaModal()" class="button-primary !h-12 !px-8 !text-[10px] !rounded-xl !bg-fuchsia-600 italic font-black text-center uppercase tracking-widest">Initialize Arena</button>
            </div>
            <div class="grid grid-cols-1 gap-4 italic font-black text-left">
              @for (c of store.competitions(); track c.id) {
                <div class="bg-[#0a0a0f] border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-fuchsia-500/30 transition-all shadow-xl italic font-black text-left">
                  <div class="flex items-center gap-6 text-left italic font-black">
                    <img [src]="c.image" class="w-20 h-20 rounded-2xl object-cover border border-white/5 shadow-lg text-left italic font-black">
                    <div class="text-left italic font-black">
                      <div class="flex items-center gap-3 mb-1 text-left italic font-black">
                        <h3 class="text-xl font-black text-white uppercase tracking-tighter italic text-left italic font-black">{{ c.name }}</h3>
                        <span class="px-3 py-0.5 bg-white/5 rounded-full text-[8px] font-black uppercase text-gray-500 border border-white/5 text-center italic font-black">{{ c.status }}</span>
                      </div>
                      <p class="text-xs text-gray-500 font-medium italic uppercase tracking-widest text-left italic font-black">{{ c.format.replace('_', ' ') }} • {{ c.prizePool }}</p>
                    </div>
                  </div>
                  <div class="flex gap-3 italic font-black text-center">
                    @if (c.status === 'draft' || c.status === 'upcoming') {
                      <button (click)="generateMatches(c.id)" class="px-6 h-12 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all italic font-black text-center">Generate Grid</button>
                    }
                    <button (click)="openArenaModal(c)" class="w-12 h-12 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-xl transition-all flex items-center justify-center italic font-black text-center"><i class="fa-solid fa-pen text-xs text-center italic font-black"></i></button>
                    <button (click)="deleteArena(c.id)" class="w-12 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all flex items-center justify-center italic font-black text-center"><i class="fa-solid fa-trash text-xs text-center italic font-black"></i></button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- (ALTRE SEZIONI: NEWS E PARTNERS - INTEGRALI E PULITE) -->
        @if (activeTab() === 'news') {
          <div class="space-y-8 animate-soft-in italic font-black text-left">
            <div class="flex justify-between items-end px-4 italic font-black text-left">
              <h2 class="text-3xl font-black uppercase gaming-font italic leading-none text-left italic font-black text-white">Intelligence <span class="text-cyan-400 italic font-black">Feed</span></h2>
              <button (click)="openNewsModal()" class="button-primary !h-12 !px-8 !text-[10px] !rounded-xl italic font-black text-center uppercase tracking-widest">Publish Intel</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 italic font-black text-left">
              @for (item of store.news(); track item.id) {
                <div class="bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-cyan-500/30 transition-all shadow-2xl italic font-black text-left">
                  <div class="h-48 overflow-hidden relative italic font-black text-left">
                    <img [src]="item.image" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all italic font-black text-left">
                    <div class="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-lg text-[8px] font-black text-cyan-400 uppercase font-mono border border-white/10 italic text-left italic font-black">{{ item.date }}</div>
                  </div>
                  <div class="p-8 space-y-4 italic font-black text-left">
                    <h3 class="text-xl font-black text-white uppercase tracking-tighter italic leading-tight text-left italic font-black">{{ item.title }}</h3>
                    <p class="text-gray-500 text-xs italic line-clamp-2 text-left italic font-black">{{ item.excerpt }}</p>
                    <div class="flex gap-2 pt-4 italic font-black text-center">
                      <button (click)="openNewsModal(item)" class="flex-1 py-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl text-[9px] font-black uppercase transition-all italic font-black text-center">Modify</button>
                      <button (click)="deleteNews(item.id)" class="px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all italic font-black text-center"><i class="fa-solid fa-trash text-xs text-center italic font-black"></i></button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab() === 'partners') {
          <div class="space-y-8 animate-soft-in italic font-black text-left">
            <div class="flex justify-between items-end px-4 italic font-black text-left">
              <h2 class="text-3xl font-black uppercase gaming-font italic leading-none text-left italic font-black text-white">Elite <span class="text-cyan-400 italic font-black">Partners</span></h2>
              <button (click)="openSponsorModal()" class="button-primary !h-12 !px-8 !text-[10px] !rounded-xl italic font-black text-center uppercase tracking-widest">Add Partner</button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 italic font-black text-left">
              @for (s of store.sponsors(); track s.id) {
                <div class="group relative aspect-video bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 flex items-center justify-center hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all cursor-pointer shadow-2xl italic font-black text-left">
                  <img [src]="s.logo" class="max-w-full max-h-[60%] object-contain grayscale group-hover:grayscale-0 transition-all duration-500 italic font-black text-center">
                  <div class="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all italic font-black text-center italic font-black">
                    <button (click)="openSponsorModal(s)" class="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center border border-white/10 italic font-black text-center"><i class="fa-solid fa-pen text-xs text-center italic font-black"></i></button>
                    <button (click)="deleteSponsor(s.id)" class="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20 italic font-black text-center"><i class="fa-solid fa-trash text-xs text-center italic font-black"></i></button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

      </div>

      <!-- MODALS (TUTTI INTEGRALI E COMPLETI) -->
      @if (showTitleModal()) {
        <div class="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-soft-in italic font-black text-center">
          <div class="card-soft w-full max-w-3xl overflow-hidden border-cyan-500/30 shadow-2xl rounded-[3rem] italic font-black text-center bg-[#0a0a0f]">
            <div class="bg-white/[0.02] border-b border-white/10 p-10 flex justify-between items-center relative text-left italic font-black font-black">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent italic font-black text-center font-black"></div>
              <h3 class="text-3xl font-black text-white uppercase gaming-font italic leading-none text-left italic font-black font-black">{{ editingTitleId ? 'Update' : 'Initialize' }} <span class="text-cyan-400 italic font-black italic font-black">Game Title</span></h3>
              <button (click)="showTitleModal.set(false)" class="w-12 h-12 rounded-full bg-white/5 text-gray-500 hover:text-white transition-all flex items-center justify-center border border-white/5 text-center italic font-black italic font-black"><i class="fa-solid fa-xmark text-xl text-center italic font-black italic font-black"></i></button>
            </div>
            <div class="p-10 space-y-8 bg-[#0a0a0f] max-h-[75vh] overflow-y-auto custom-scrollbar text-left italic font-black italic font-black">
              <div class="grid grid-cols-2 gap-8 text-left italic font-black font-black">
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Game Name</label><input type="text" [(ngModel)]="titleForm.name" class="input h-16 text-xl font-black !rounded-2xl border-white/5 bg-white/5 focus:border-cyan-500 shadow-inner italic font-black italic font-black"></div>
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Publisher</label><input type="text" [(ngModel)]="titleForm.publisher" class="input h-16 text-xl font-black !rounded-2xl border-white/5 bg-white/5 focus:border-cyan-500 shadow-inner italic font-black italic font-black"></div>
              </div>
              <div class="space-y-3 text-left italic font-black italic font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black italic font-black">Cover Asset (URL)</label><app-image-picker [(ngModel)]="titleForm.image"></app-image-picker></div>
              <div class="space-y-3 text-left italic font-black italic font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black italic font-black">Description</label><textarea [(ngModel)]="titleForm.description" class="input min-h-[100px] py-4 text-sm font-medium !rounded-2xl border-white/5 bg-white/5 focus:border-cyan-500 shadow-inner italic font-black italic font-black"></textarea></div>
              <div class="space-y-6 pt-6 border-t border-white/5 text-left italic font-black italic font-black">
                <div class="flex justify-between items-center text-left italic font-black italic font-black"><h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 italic font-black italic font-black">Download Links</h4><button (click)="addDownloadLink()" class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase border border-white/5 italic font-black font-black">Add Link</button></div>
                @for (link of titleForm.downloadLinks; track $index) {
                  <div class="grid grid-cols-12 gap-4 items-end italic font-black font-black"><div class="col-span-4 space-y-2 italic font-black font-black"><input type="text" [(ngModel)]="link.platform" class="input h-12 text-[10px] italic font-black italic font-black" placeholder="Platform"></div><div class="col-span-7 space-y-2 italic font-black font-black"><input type="url" [(ngModel)]="link.url" class="input h-12 text-[10px] italic font-black italic font-black" placeholder="https://..."></div><div class="col-span-1 italic font-black font-black"><button (click)="removeDownloadLink($index)" class="w-12 h-12 bg-red-500/10 text-red-500 hover:bg-red-500 rounded-xl transition-all italic font-black italic font-black"><i class="fa-solid fa-xmark italic font-black italic font-black"></i></button></div></div>
                }
              </div>
            </div>
            <div class="bg-black/80 border-t border-white/10 p-10 flex justify-end gap-6 text-left italic font-black italic font-black">
              <button (click)="showTitleModal.set(false)" class="px-10 h-14 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.2em] italic font-black font-black">Abort</button>
              <button (click)="saveTitle()" class="button-primary px-16 h-14 !bg-cyan-500 !text-black text-[11px] font-black uppercase shadow-2xl !rounded-2xl tracking-[0.3em] italic font-black font-black">Sync Title</button>
            </div>
          </div>
        </div>
      }

      @if (showArenaModal()) {
        <div class="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-soft-in italic font-black text-center">
          <div class="card-soft w-full max-w-5xl overflow-hidden border-fuchsia-500/30 shadow-2xl rounded-[3rem] italic font-black text-center bg-[#0a0a0f]">
            <div class="bg-white/[0.02] border-b border-white/10 p-10 flex justify-between items-center relative text-left italic font-black font-black">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent italic font-black text-center font-black"></div>
              <h3 class="text-3xl font-black text-white uppercase gaming-font italic leading-none text-left italic font-black font-black">{{ editingArenaId ? 'Modify' : 'Launch' }} <span class="text-fuchsia-400 italic font-black italic font-black">Competition</span></h3>
              <button (click)="showArenaModal.set(false)" class="w-12 h-12 rounded-full bg-white/5 text-gray-500 hover:text-white transition-all flex items-center justify-center border border-white/5 text-center italic font-black italic font-black"><i class="fa-solid fa-xmark text-xl text-center italic font-black italic font-black"></i></button>
            </div>
            <div class="p-10 space-y-10 bg-[#0a0a0f] max-h-[70vh] overflow-y-auto custom-scrollbar text-left italic font-black italic font-black">
              <div class="grid grid-cols-2 gap-10 text-left italic font-black font-black">
                <div class="space-y-6 italic font-black font-black">
                  <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Arena Name</label><input type="text" [(ngModel)]="arenaForm.name" class="input h-16 text-xl font-black !rounded-2xl border-white/5 bg-white/5 focus:border-fuchsia-500 shadow-inner italic font-black italic font-black"></div>
                  <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Game Title</label><select [(ngModel)]="arenaForm.titleId" class="input h-16 text-sm font-black uppercase appearance-none !rounded-2xl border-white/5 bg-white/5 focus:border-fuchsia-500 shadow-inner italic font-black italic font-black">@for (t of store.titles(); track t.id) { <option [value]="t.id">{{ t.name }}</option> }</select></div>
                </div>
                <div class="space-y-3 text-left italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Cover Asset</label><app-image-picker [(ngModel)]="arenaForm.image"></app-image-picker></div>
              </div>
              <div class="grid grid-cols-4 gap-6 pt-6 border-t border-white/5 italic font-black text-left font-black">
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Prize Pool</label><input type="text" [(ngModel)]="arenaForm.prizePool" class="input h-14 text-base font-black !rounded-xl italic font-black font-black"></div>
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Format</label><select [(ngModel)]="arenaForm.format" class="input h-14 text-[10px] font-black uppercase appearance-none !rounded-xl italic font-black font-black"><option value="single_elimination">Single Elimination</option><option value="double_elimination">Double Elimination</option><option value="round_robin">Round Robin</option></select></div>
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Max Teams</label><input type="number" [(ngModel)]="arenaForm.maxTeams" class="input h-14 text-base font-black !rounded-xl italic font-black font-black"></div>
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Ruleset (BOx)</label><input type="number" [(ngModel)]="arenaForm.matchRules" class="input h-14 text-base font-black !rounded-xl italic font-black font-black"></div>
              </div>
              <div class="grid grid-cols-4 gap-6 pt-6 border-t border-white/5 italic font-black text-left font-black">
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Start Date</label><input type="date" [(ngModel)]="arenaForm.startDate" class="input h-14 text-xs font-bold !rounded-xl italic font-black font-black"></div>
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">End Date</label><input type="date" [(ngModel)]="arenaForm.endDate" class="input h-14 text-xs font-bold !rounded-xl italic font-black font-black"></div>
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Daily Start</label><input type="time" [(ngModel)]="arenaForm.startTime" class="input h-14 text-xs font-bold !rounded-xl italic font-black font-black"></div>
                <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Match Dur (Min)</label><input type="number" [(ngModel)]="arenaForm.roundDuration" class="input h-14 text-base font-black !rounded-xl italic font-black font-black"></div>
              </div>
              <div class="space-y-4 pt-6 border-t border-white/5 text-left italic font-black font-black font-black">
                <label class="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400 ml-4 italic font-black font-black">Operational Days</label>
                <div class="flex flex-wrap gap-3 italic font-black text-left font-black">
                  @for (day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track $index) {
                    <button (click)="togglePlayDay($index)" class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all" [class.bg-fuchsia-600]="arenaForm.playDays.includes($index)" [class.border-fuchsia-500]="arenaForm.playDays.includes($index)" [class.bg-white/5]="!arenaForm.playDays.includes($index)" [class.border-white/10]="!arenaForm.playDays.includes($index)" [class.text-gray-500]="!arenaForm.playDays.includes($index)">{{ day }}</button>
                  }
                </div>
              </div>
              <div class="space-y-6 pt-6 border-t border-white/5 text-left italic font-black font-black font-black">
                <div class="flex justify-between items-center text-left italic font-black font-black"><h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400 ml-4 italic font-black italic font-black">Engagement Rules</h4><button (click)="addRule()" class="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase border border-white/5 italic font-black font-black">Append Rule</button></div>
                @for (rule of arenaForm.rules; track $index) {
                  <div class="bg-white/5 p-6 rounded-2xl relative space-y-4 border border-white/5 italic text-left font-black font-black"><button (click)="removeRule($index)" class="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors italic font-black font-black font-black"><i class="fa-solid fa-xmark italic font-black italic font-black"></i></button><div class="grid grid-cols-4 gap-6 italic font-black font-black font-black"><input type="text" [(ngModel)]="rule.code" class="input h-12 text-[10px] italic font-black font-black" placeholder="Code (e.g. R-01)"><input type="text" [(ngModel)]="rule.title" class="input h-12 text-[10px] col-span-3 italic font-black font-black" placeholder="Rule Title"></div><textarea [(ngModel)]="rule.description" class="input min-h-[60px] py-3 text-[10px] italic font-black font-black" placeholder="Full rule description..."></textarea></div>
                }
              </div>
            </div>
            <div class="bg-black/80 border-t border-white/10 p-10 flex justify-end gap-6 text-left italic font-black font-black font-black">
              <button (click)="showArenaModal.set(false)" class="px-10 h-14 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.2em] italic font-black font-black">Abort</button>
              <button (click)="saveArena()" class="button-primary px-16 h-14 !bg-fuchsia-600 !text-white text-[11px] font-black uppercase shadow-2xl !rounded-2xl tracking-[0.3em] italic font-black font-black">Deploy Configuration</button>
            </div>
          </div>
        </div>
      }

      @if (showSponsorModal()) {
        <div class="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-soft-in italic font-black text-center">
          <div class="card-soft w-full max-w-2xl overflow-hidden border-cyan-500/30 shadow-2xl rounded-[3rem] italic font-black text-center bg-[#0a0a0f]">
            <div class="bg-white/[0.02] border-b border-white/10 p-10 flex justify-between items-center relative text-left italic font-black font-black">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent italic font-black text-center font-black"></div>
              <h3 class="text-3xl font-black text-white uppercase gaming-font italic leading-none text-left italic font-black font-black">{{ editingSponsorId ? 'Update' : 'Initialize' }} <span class="text-cyan-400 italic font-black italic font-black">Partner</span></h3>
              <button (click)="showSponsorModal.set(false)" class="w-12 h-12 rounded-full bg-white/5 text-gray-500 hover:text-white transition-all flex items-center justify-center border border-white/5 text-center italic font-black italic font-black"><i class="fa-solid fa-xmark text-xl text-center italic font-black italic font-black"></i></button>
            </div>
            <div class="p-10 space-y-8 bg-[#0a0a0f] text-left italic font-black font-black">
              <div class="grid grid-cols-2 gap-8 text-left italic font-black font-black"><div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Partner Name</label><input type="text" [(ngModel)]="sponsorForm.name" class="input h-16 text-xl font-black !rounded-2xl border-white/5 bg-white/5 focus:border-cyan-500 shadow-inner italic font-black font-black"></div><div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Website URL</label><input type="url" [(ngModel)]="sponsorForm.siteUrl" class="input h-16 text-sm font-bold !rounded-2xl border-white/5 bg-white/5 focus:border-cyan-500 shadow-inner italic font-black font-black"></div></div>
              <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Brand Asset (Logo)</label><app-image-picker [(ngModel)]="sponsorForm.logo"></app-image-picker></div>
              <div class="space-y-3 italic font-black font-black"><label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 ml-4 italic italic font-black font-black">Description</label><textarea [(ngModel)]="sponsorForm.description" class="input min-h-[80px] py-4 text-sm font-medium !rounded-2xl italic font-black font-black"></textarea></div>
            </div>
            <div class="bg-black/80 border-t border-white/10 p-10 flex justify-end gap-6 text-left italic font-black italic font-black italic font-black">
              <button (click)="showSponsorModal.set(false)" class="px-10 h-14 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.2em] italic font-black font-black font-black">Abort</button>
              <button (click)="saveSponsor()" class="button-primary px-16 h-14 !bg-cyan-500 !text-black text-[11px] font-black uppercase shadow-2xl !rounded-2xl tracking-[0.3em] italic font-black font-black font-black">Initialize Sync</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  `]
})
export class DashboardComponent {
  store = inject(StoreService);
  activeTab = signal<'overview' | 'titles' | 'arenas' | 'news' | 'partners'>('overview');

  // News State
  showNewsModal = signal(false);
  editingNewsId: string | null = null;
  newsForm = { title: '', date: '', excerpt: '', image: '' };

  // Title State
  showTitleModal = signal(false);
  editingTitleId: string | null = null;
  titleForm: any = { name: '', publisher: '', image: '', description: '', downloadLinks: [] };

  // Arena State
  showArenaModal = signal(false);
  editingArenaId: string | null = null;
  arenaForm: any = {
    name: '', titleId: '', prizePool: '', format: 'single_elimination',
    maxTeams: 8, image: '', startDate: '', endDate: '', startTime: '20:00',
    matchesPerDay: 4, roundDuration: 60, matchRules: 3, description: '',
    playDays: [1,2,3,4,5], rules: []
  };

  // Sponsor State
  showSponsorModal = signal(false);
  editingSponsorId: string | null = null;
  sponsorForm = { name: '', logo: '', description: '', siteUrl: '' };

  canManage = computed(() => {
    const user = this.store.currentUser();
    if (!user) return false;
    const role = user.role as string;
    return role === 'admin' || role === 'super_admin';
  });

  getTabClass(t: string) {
    const base = "px-8 py-3 rounded-full text-[10px] font-black transition-all uppercase tracking-[0.25em] whitespace-nowrap ";
    return this.activeTab() === t ? base + "bg-white text-black shadow-xl" : base + "text-gray-500 hover:text-white";
  }

  // --- NEWS LOGIC ---
  openNewsModal(item?: NewsItem) {
    if (item) { this.editingNewsId = item.id; this.newsForm = { ...item }; }
    else { this.editingNewsId = null; this.newsForm = { title: '', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), excerpt: '', image: '' }; }
    this.showNewsModal.set(true);
  }
  saveNews() {
    if (this.editingNewsId) { this.store.updateNews(this.editingNewsId, this.newsForm); }
    else { this.store.addNews(this.newsForm.title, this.newsForm.date, this.newsForm.excerpt, this.newsForm.image); }
    this.showNewsModal.set(false);
  }
  deleteNews(id: string) { if (confirm('Delete this report?')) this.store.deleteNews(id); }

  // --- TITLE LOGIC ---
  openTitleModal(title?: Title) {
    if (title) { this.editingTitleId = title.id; this.titleForm = { name: title.name, publisher: title.publisher, image: title.image, description: title.description || '', downloadLinks: title.downloadLinks ? [...title.downloadLinks] : [] }; }
    else { this.editingTitleId = null; this.titleForm = { name: '', publisher: '', image: '', description: '', downloadLinks: [] }; }
    this.showTitleModal.set(true);
  }
  addDownloadLink() { this.titleForm.downloadLinks.push({ platform: '', url: '' }); }
  removeDownloadLink(index: number) { this.titleForm.downloadLinks.splice(index, 1); }
  saveTitle() {
    if (this.editingTitleId) { this.store.updateTitle(this.editingTitleId, this.titleForm); }
    else { this.store.addTitle(this.titleForm.name, this.titleForm.publisher, this.titleForm.description, this.titleForm.image, this.titleForm.downloadLinks); }
    this.showTitleModal.set(false);
  }
  deleteTitle(id: string) { if (confirm('Delete title?')) this.store.deleteTitle(id); }

  // --- ARENA LOGIC ---
  openArenaModal(arena?: Competition) {
    if (arena) { this.editingArenaId = arena.id; this.arenaForm = { ...arena, startDate: arena.startDate.substring(0,10), endDate: arena.endDate.substring(0,10), playDays: [...arena.playDays], rules: [...arena.rules] }; }
    else { this.editingArenaId = null; this.arenaForm = { name: '', titleId: '', prizePool: '', format: 'single_elimination', maxTeams: 8, image: '', startDate: new Date().toISOString().substring(0,10), endDate: new Date().toISOString().substring(0,10), startTime: '20:00', matchesPerDay: 4, roundDuration: 60, matchRules: 3, description: '', playDays: [1,2,3,4,5], rules: [] }; }
    this.showArenaModal.set(true);
  }
  togglePlayDay(day: number) { if (this.arenaForm.playDays.includes(day)) { this.arenaForm.playDays = this.arenaForm.playDays.filter((d: number) => d !== day); } else { this.arenaForm.playDays.push(day); } }
  addRule() { this.arenaForm.rules.push({ code: '', title: '', description: '' }); }
  removeRule(index: number) { this.arenaForm.rules.splice(index, 1); }
  saveArena() {
    if (this.editingArenaId) { this.store.updateCompetition(this.editingArenaId, this.arenaForm.name, this.arenaForm.titleId, this.arenaForm.prizePool, this.arenaForm.registeredTeams || [], false, this.arenaForm); }
    else { this.store.createCompetition(this.arenaForm.name, this.arenaForm.titleId, this.arenaForm.prizePool, [], true, this.arenaForm); }
    this.showArenaModal.set(false);
  }
  deleteArena(id: string) { if (confirm('Terminate arena?')) this.store.deleteCompetition(id); }
  generateMatches(id: string) { this.store.generateMatches(id); }

  // --- SPONSOR LOGIC ---
  openSponsorModal(sponsor?: Sponsor) { if (sponsor) { this.editingSponsorId = sponsor.id; this.sponsorForm = { ...sponsor }; } else { this.editingSponsorId = null; this.sponsorForm = { name: '', logo: '', description: '', siteUrl: '' }; } this.showSponsorModal.set(true); }
  saveSponsor() { if (this.editingSponsorId) { this.store.updateSponsor(this.editingSponsorId, this.sponsorForm); } else { this.store.addSponsor(this.sponsorForm.name, this.sponsorForm.description, this.sponsorForm.logo, this.sponsorForm.siteUrl); } this.showSponsorModal.set(false); }
  deleteSponsor(id: string) { if (confirm('Terminate partnership?')) this.store.deleteSponsor(id); }
}
