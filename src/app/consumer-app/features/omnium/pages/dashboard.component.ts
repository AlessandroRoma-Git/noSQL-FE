import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService, Sponsor } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from '../../../../common/components/image-picker/image-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ImagePickerComponent],
  template: `
    <div class="min-h-screen bg-[#050505] text-white p-6 md:p-12 space-y-16 animate-soft-in">
      
      <!-- HERO HEADER -->
      <header class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pt-10">
        <div class="space-y-4 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-3">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
            <span class="text-cyan-400 font-black text-xs tracking-[0.4em] uppercase">Control Center</span>
          </div>
          <h1 class="text-6xl md:text-8xl font-black gaming-font leading-none uppercase tracking-tighter italic">
            Dashboard
          </h1>
          <p class="text-gray-500 text-lg max-w-xl font-medium italic">
            Welcome back, <span class="text-white">{{ store.currentUser()?.name }}</span>. Here is the operational status of your gaming ecosystem.
          </p>
        </div>
        
        <div class="flex gap-6">
          <div class="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 min-w-[180px] shadow-2xl group hover:border-cyan-500/30 transition-all text-center">
            <div class="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-[0.2em] group-hover:text-cyan-400 transition-colors">Active Matches</div>
            <div class="text-5xl font-black text-white font-mono leading-none">{{ store.matches().length }}</div>
          </div>
          <div class="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 min-w-[180px] shadow-2xl group hover:border-fuchsia-500/30 transition-all text-center">
            <div class="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-[0.2em] group-hover:text-fuchsia-400 transition-colors">Elo Ranking</div>
            <div class="text-5xl font-black text-white italic leading-none font-mono">{{ store.currentUser()?.elo || 0 }}</div>
          </div>
        </div>
      </header>

      <!-- SPONSORS / PARTNERS SECTION -->
      <section class="max-w-7xl mx-auto space-y-10">
        <div class="flex items-end justify-between px-4">
          <div class="space-y-2">
            <h2 class="text-3xl font-black uppercase tracking-tighter gaming-font italic leading-none">Elite <span class="text-cyan-400">Partners</span></h2>
            <p class="text-gray-500 text-sm italic font-medium">Organizations fueling the competition.</p>
          </div>
          @if (canManage()) {
            <button (click)="openSponsorModal()" class="px-8 h-12 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-xl">
              <i class="fa-solid fa-plus mr-2"></i> Manage Partners
            </button>
          }
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          @for (s of store.sponsors(); track s.id) {
            <div class="group relative aspect-video bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-center hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden shadow-2xl">
              <img [src]="s.logo" class="max-w-[80%] max-h-[60%] object-contain grayscale group-hover:grayscale-0 transition-all duration-500" [alt]="s.name">
              
              <!-- Quick Actions for Admins -->
              @if (canManage()) {
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button (click)="openSponsorModal(s)" class="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center border border-white/10">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                  <button (click)="deleteSponsor(s.id)" class="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20">
                    <i class="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              }
            </div>
          }
          @if (store.sponsors().length === 0) {
            <div class="col-span-full py-20 text-center card-soft border-dashed border-2 border-white/5 opacity-30 rounded-[3rem]">
              <p class="text-gray-500 font-black uppercase tracking-[0.3em] text-xs italic">Awaiting strategic partnerships...</p>
            </div>
          }
        </div>
      </section>

      <!-- MODALS AND OVERLAYS -->
      @if (showSponsorModal()) {
        <div class="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-soft-in">
          <div class="card-soft w-full max-w-2xl overflow-hidden border-cyan-500/30 shadow-[0_0_100px_rgba(34,211,238,0.2)] rounded-[3rem]">
            <div class="bg-white/[0.02] border-b border-white/10 p-10 flex justify-between items-center relative">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div class="space-y-1">
                <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font leading-none italic">
                  {{ editingSponsorId ? 'Update' : 'Register' }} <span class="text-cyan-400 italic">Partner</span>
                </h3>
                <p class="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Strategic Sponsor Configuration</p>
              </div>
              <button (click)="showSponsorModal.set(false)" class="w-12 h-12 rounded-full bg-white/5 text-gray-500 hover:text-white transition-all flex items-center justify-center border border-white/5"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <div class="p-10 space-y-10 bg-[#0a0a0f]">
              <div class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-4">
                    <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic">Entity Name</label>
                    <input type="text" [(ngModel)]="sponsorForm.name" class="input h-16 text-xl font-black !rounded-2xl border-white/10 shadow-inner italic focus:border-cyan-500" placeholder="e.g. NVIDIA">
                  </div>
                  <div class="space-y-4">
                    <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic">Official Website</label>
                    <input type="url" [(ngModel)]="sponsorForm.siteUrl" class="input h-16 text-sm font-bold !rounded-2xl border-white/10 shadow-inner italic focus:border-cyan-500" placeholder="https://...">
                  </div>
                </div>

                <div class="space-y-4">
                  <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic">Brand Asset (Logo)</label>
                  <app-image-picker [(ngModel)]="sponsorForm.logo"></app-image-picker>
                </div>

                <div class="space-y-4">
                  <label class="label text-[10px] uppercase font-black tracking-widest text-gray-600 italic">Partnership Description</label>
                  <textarea [(ngModel)]="sponsorForm.description" class="input min-h-[120px] py-4 text-sm font-medium !rounded-2xl border-white/10 shadow-inner italic focus:border-cyan-500" placeholder="Describe the collaboration..."></textarea>
                </div>
              </div>
            </div>

            <div class="bg-black/80 border-t border-white/10 p-10 flex justify-end gap-6">
              <button (click)="showSponsorModal.set(false)" class="px-10 h-14 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.2em] italic">Abort Operation</button>
              <button (click)="saveSponsor()" class="button-primary px-16 h-14 !bg-cyan-500 !text-black text-[11px] font-black uppercase shadow-2xl !rounded-2xl tracking-[0.3em]">Initialize Sync</button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class DashboardComponent {
  store = inject(StoreService);

  showSponsorModal = signal(false);
  editingSponsorId: string | null = null;
  sponsorForm = { name: '', logo: '', description: '', siteUrl: '' };

  canManage = computed(() => {
    const user = this.store.currentUser();
    if (!user) return false;
    return user.role === 'admin' || user.role === 'super_admin';
  });

  openSponsorModal(sponsor?: Sponsor) {
    if (sponsor) {
      this.editingSponsorId = sponsor.id;
      this.sponsorForm = { ...sponsor };
    } else {
      this.editingSponsorId = null;
      this.sponsorForm = { name: '', logo: '', description: '', siteUrl: '' };
    }
    this.showSponsorModal.set(true);
  }

  saveSponsor() {
    if (this.editingSponsorId) {
      this.store.updateSponsor(this.editingSponsorId, this.sponsorForm);
    } else {
      this.store.addSponsor(this.sponsorForm.name, this.sponsorForm.description, this.sponsorForm.logo, this.sponsorForm.siteUrl);
    }
    this.showSponsorModal.set(false);
  }

  deleteSponsor(id: string) {
    if (confirm('Are you sure you want to terminate this partnership record?')) {
      this.store.deleteSponsor(id);
    }
  }
}
