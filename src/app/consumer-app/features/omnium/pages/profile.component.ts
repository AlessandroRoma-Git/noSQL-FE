import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StoreService, User } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from '../../../../common/components/image-picker/image-picker.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ImagePickerComponent],
  template: `
    @if (user(); as u) {
      <div class="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans pb-32 animate-soft-in">
        
        <!-- CINEMATIC COVER -->
        <div class="relative h-[30vh] md:h-[40vh] w-full overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-[#050505]/40 to-[#050505] z-10"></div>
           <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2070" 
                class="w-full h-full object-cover opacity-30 scale-105" alt="Cover">
        </div>

        <div class="max-w-7xl mx-auto px-6 relative z-20 -mt-24 md:-mt-32">
           
           <!-- PROFILE IDENTITY CARD -->
           <div class="bg-[#0a0a0f]/80 border border-white/10 rounded-[3rem] p-10 md:p-16 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-10">
              
              <!-- Avatar Slot -->
              <div class="shrink-0 relative">
                 @if (isEditing()) {
                    <div class="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden border-2 border-cyan-500 shadow-[0_0_40px_rgba(34,211,238,0.3)] bg-black">
                       <app-image-picker [ngModel]="editAvatar" (ngModelChange)="editAvatar = $event"></app-image-picker>
                    </div>
                 } @else {
                    <div class="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] border-4 border-black/50 shadow-2xl overflow-hidden group relative">
                       <img [src]="u.avatar || 'assets/default-avatar.png'" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.src='https://ui-avatars.com/api/?name=' + u.name + '&background=random'">
                    </div>
                    <div class="absolute -bottom-4 -right-4 px-6 py-2 bg-cyan-500 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-cyan-400">
                        <span class="text-[10px] font-black text-black uppercase tracking-[0.2em]">{{ u.role }}</span>
                    </div>
                 }
              </div>

              <!-- Primary Info -->
              <div class="flex-grow text-center md:text-left space-y-6">
                 <div class="space-y-2">
                    <div class="flex items-center justify-center md:justify-start gap-3">
                       <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_green]"></span>
                       <span class="text-green-500 font-black text-[10px] tracking-[0.3em] uppercase">Tactical Status: Operational</span>
                    </div>
                    <h1 class="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter gaming-font italic leading-none">{{ u.name }}</h1>
                 </div>
                 
                 @if (isEditing()) {
                    <div class="space-y-4 max-w-2xl">
                       <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 italic">Personnel Biography</label>
                       <textarea [(ngModel)]="editDescription" class="input min-h-[120px] py-6 text-base font-medium italic !rounded-3xl border-white/10 focus:border-cyan-500 shadow-inner" placeholder="Log your operative history..."></textarea>
                    </div>
                 } @else {
                    <p class="text-gray-400 max-w-xl text-lg font-medium italic leading-relaxed">
                       {{ u.description || 'No personnel bio has been initialized for this operative.' }}
                    </p>
                 }
                 
                 <div class="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                    @if (u.teamId) {
                       <div class="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-3">
                          <i class="fa-solid fa-shield-halved text-xs"></i> Squad Member
                       </div>
                    }
                    <div class="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-3">
                       <i class="fa-solid fa-calendar-check text-xs"></i> Joined Nov 2023
                    </div>
                 </div>
              </div>

              <!-- Terminal Actions -->
              <div class="flex flex-col gap-4 w-full md:w-auto shrink-0">
                 @if (isCurrentUser()) {
                    @if (isEditing()) {
                       <button (click)="saveProfile()" class="w-full md:px-12 h-16 rounded-[1.5rem] bg-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                          Commit Changes
                       </button>
                       <button (click)="isEditing.set(false)" class="w-full md:px-12 h-16 rounded-[1.5rem] bg-white/5 text-gray-500 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">
                          Abort Operation
                       </button>
                    } @else {
                       <button (click)="startEditing(u)" class="w-full md:px-12 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all shadow-xl">
                          Override Profile
                       </button>
                       <button (click)="logout()" class="w-full md:px-12 h-16 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all">
                          Terminal Logout
                       </button>
                    }
                 } @else {
                    <button class="w-full md:px-16 h-16 rounded-[1.5rem] bg-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                       Establish Link
                    </button>
                    <button class="w-full md:px-12 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">
                       Message Operative
                    </button>
                 }
              </div>
           </div>

           <!-- OPERATIONAL INTEL GRID -->
           <div class="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              <!-- TACTICAL STATS -->
              <div class="lg:col-span-1 space-y-10">
                 @if (u.role === 'player') {
                    <div class="bg-[#0a0a0f] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                       <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] pointer-events-none"></div>
                       <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-cyan-500 pl-6 leading-none">Combat Metrics</h3>
                       <div class="space-y-6">
                          <div class="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                             <span class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Efficiency (Elo)</span>
                             <span class="text-3xl font-black font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{{ u.elo }}</span>
                          </div>
                          <div class="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                             <span class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Engagements</span>
                             <span class="text-3xl font-black font-mono text-white">42</span>
                          </div>
                          <div class="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                             <span class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Victory Ratio</span>
                             <span class="text-3xl font-black font-mono text-green-400">58%</span>
                          </div>
                       </div>
                    </div>
                 }
                 
                 <!-- SQUAD BADGES -->
                 <div class="bg-[#0a0a0f] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
                    <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-white/20 pl-6 leading-none">Distinctions</h3>
                    <div class="flex flex-wrap gap-4">
                       @for (badge of ['Veteran', 'Elite Caster', 'Champion']; track badge) {
                          <div class="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:border-cyan-500/30 transition-all cursor-default">
                             {{ badge }}
                          </div>
                       }
                    </div>
                 </div>
              </div>

              <!-- ACTIVITY LOG / FEED -->
              <div class="lg:col-span-2 space-y-10">
                 <div class="bg-[#0a0a0f] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
                    <h3 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-fuchsia-500 pl-6 leading-none">Tactical Timeline</h3>
                    <div class="space-y-4">
                       @for (act of [1,2,3]; track $index) {
                          <div class="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6 group hover:bg-white/5 transition-all">
                             <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                <i class="fa-solid fa-bolt-lightning text-lg"></i>
                             </div>
                             <div class="flex-grow">
                                <p class="text-white font-black text-lg uppercase tracking-tight">System Notification: Conflict Victory</p>
                                <p class="text-gray-500 text-sm italic font-medium">Secured dominance in Cyber Winter Cup #{{$index + 1}}</p>
                             </div>
                             <div class="text-[10px] font-mono text-gray-600 font-black uppercase">2 days ago</div>
                          </div>
                       }
                    </div>
                 </div>

                 <!-- CASTER REVIEWS -->
                 @if (u.role === 'caster' || u.role === 'super_admin' || u.role === 'admin') {
                    <div class="bg-[#0a0a0f] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
                       <h2 class="text-2xl font-black text-white uppercase tracking-tighter gaming-font italic mb-10 border-l-4 border-yellow-500 pl-6 leading-none">Transmission Feedback</h2>
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          @for (review of reviews(); track review.id) {
                             <div class="p-8 bg-white/5 border border-white/5 rounded-[2rem] space-y-6 group hover:border-yellow-500/30 transition-all">
                                <div class="flex items-center gap-4">
                                   <img [src]="review.avatar" class="w-12 h-12 rounded-xl bg-gray-800 object-cover shadow-lg">
                                   <div class="flex-grow">
                                      <p class="text-white font-black uppercase text-sm tracking-widest">{{ review.authorName }}</p>
                                      <div class="flex text-yellow-500 text-[10px] gap-1">
                                         @for (star of [1,2,3,4,5]; track star) {
                                            <i class="fa-solid fa-star" [class.opacity-20]="star > review.rating"></i>
                                         }
                                      </div>
                                   </div>
                                </div>
                                <p class="text-gray-400 text-sm italic leading-relaxed">"{{ review.comment }}"</p>
                             </div>
                          }
                          @if (reviews().length === 0) {
                             <div class="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
                                <p class="text-[10px] font-black uppercase text-gray-500 tracking-widest">No feedback signals received.</p>
                             </div>
                          }
                       </div>
                    </div>
                 }
              </div>

           </div>

        </div>
      </div>
    } @else {
      <div class="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10">
         <i class="fa-solid fa-ghost text-6xl text-gray-800 mb-8 animate-bounce"></i>
         <h1 class="text-4xl font-black text-gray-700 uppercase tracking-widest gaming-font">Operative Not Found</h1>
         <a routerLink="/app" class="mt-8 text-cyan-400 font-black uppercase text-xs tracking-[0.4em] hover:text-white transition-colors">Return to Base</a>
      </div>
    }
  `
})
export class ProfileComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  userId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'me') return this.store.currentUser()?.id || '';
    return id || '';
  });

  user = computed(() => this.store.getUserById(this.userId())());
  reviews = computed(() => this.store.getReviewsByCasterId(this.userId())());

  isCurrentUser = computed(() => {
     const currentUser = this.store.currentUser();
     const pageUser = this.user();
     return currentUser && pageUser && currentUser.id === pageUser.id;
  });

  isEditing = signal(false);
  editAvatar = '';
  editDescription = '';

  startEditing(user: User) {
     this.editAvatar = user.avatar;
     this.editDescription = user.description || '';
     this.isEditing.set(true);
  }

  saveProfile() {
     this.store.updateUserProfile(this.userId(), {
        avatar: this.editAvatar,
        description: this.editDescription
     });
     this.isEditing.set(false);
  }

  logout() {
     this.store.logout();
  }
}
