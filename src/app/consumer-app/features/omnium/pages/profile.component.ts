import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService, User } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { ImagePickerComponent } from 'app/common/components/image-picker/image-picker.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ImagePickerComponent, RouterLink],
  template: `
    @if (user(); as u) {
      <div class="min-h-screen pb-20">
        
        <!-- Cover Image -->
        <div class="relative h-64 md:h-80 w-full overflow-hidden group">
           <div class="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-[#050505]/20 to-[#050505] z-10"></div>
           <!-- Placeholder for cover if user had one, otherwise gradient -->
           <div class="absolute inset-0 bg-[url('https://picsum.photos/seed/cover/1600/600')] bg-cover bg-center opacity-40"></div>
        </div>

        <!-- Main Content Container -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-24 md:-mt-32">
           
           <!-- Profile Header Card -->
           <div class="glass-panel p-6 md:p-10 rounded-3xl backdrop-blur-xl bg-black/60 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 border border-white/10">
              
              <!-- Avatar -->
              <div class="shrink-0 relative">
                 @if (isEditing()) {
                    <div class="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                       <app-image-picker [ngModel]="editAvatar" (ngModelChange)="editAvatar = $event"></app-image-picker>
                    </div>
                 } @else {
                    <img [src]="u.avatar" class="w-32 h-32 md:w-48 md:h-48 rounded-2xl border-4 border-black/50 shadow-2xl object-cover bg-gray-800">
                    <div class="absolute -bottom-3 -right-3 bg-black/80 p-2 rounded-lg border border-white/10 backdrop-blur-sm">
                        <span class="text-xs font-bold uppercase tracking-widest" 
                              [class.text-cyan-400]="u.role === 'player'"
                              [class.text-fuchsia-400]="u.role === 'caster'"
                              [class.text-red-400]="u.role === 'admin'">
                           {{ u.role }}
                        </span>
                    </div>
                 }
              </div>

              <!-- Info -->
              <div class="flex-grow text-center md:text-left space-y-2 pb-2">
                 <h1 class="text-4xl md:text-6xl font-bold text-white gaming-font tracking-wide leading-none">{{ u.name }}</h1>
                 
                 @if (isEditing()) {
                    <textarea [(ngModel)]="editDescription" class="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-cyan-500 focus:outline-none mt-4" rows="3" placeholder="Scrivi qualcosa su di te..."></textarea>
                 } @else {
                    <p class="text-gray-400 max-w-lg mx-auto md:mx-0 text-sm md:text-base">{{ u.description || 'No bio available for this user.' }}</p>
                 }
                 
                 <!-- Badges / Team -->
                 <div class="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    @if (u.teamId) {
                       <span class="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Team Member
                       </span>
                    }
                    @if (u.status === 'active') {
                       <span class="px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">Online</span>
                    }
                 </div>
              </div>

              <!-- Actions (Right Side) -->
              <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                 @if (isCurrentUser()) {
                    @if (isEditing()) {
                       <button (click)="saveProfile()" class="flex-1 md:flex-none px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-cyan-900/20 text-sm">
                          Salva
                       </button>
                       <button (click)="isEditing.set(false)" class="flex-1 md:flex-none px-8 py-3 rounded-xl bg-white/5 text-gray-400 font-bold uppercase tracking-wider hover:bg-white/10 transition-all text-sm">
                          Annulla
                       </button>
                    } @else {
                       <button (click)="startEditing(u)" class="flex-1 md:flex-none px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold uppercase tracking-wider transition-all text-sm">
                          Modifica Profilo
                       </button>
                       <button (click)="logout()" class="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 font-bold uppercase tracking-wider transition-all text-sm">
                          Logout
                       </button>
                    }
                 } @else {
                    <!-- Public Actions -->
                    <button class="flex-1 md:flex-none px-8 py-3 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:scale-105 transition-transform text-sm">
                       Follow
                    </button>
                    <button class="flex-1 md:flex-none px-4 py-3 rounded-xl glass-panel text-white hover:bg-white/10 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                 }
              </div>
           </div>

           <!-- Content Sections -->
           <div class="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <!-- Left Column: Stats -->
              <div class="lg:col-span-1 space-y-6">
                 <!-- Stats Card -->
                 @if (u.role === 'player') {
                    <div class="glass-panel p-6 rounded-2xl">
                       <h3 class="text-white font-bold gaming-font text-xl mb-6 border-l-2 border-cyan-500 pl-3">PLAYER STATS</h3>
                       <div class="space-y-4">
                          <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                             <span class="text-xs text-gray-500 uppercase font-bold">ELO Rating</span>
                             <span class="text-2xl font-mono text-cyan-400">{{ u.elo }}</span>
                          </div>
                          <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                             <span class="text-xs text-gray-500 uppercase font-bold">Matches</span>
                             <span class="text-2xl font-mono text-white">42</span>
                          </div>
                          <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                             <span class="text-xs text-gray-500 uppercase font-bold">Win Rate</span>
                             <span class="text-2xl font-mono text-green-400">58%</span>
                          </div>
                       </div>
                    </div>
                 } @else if (u.role === 'caster') {
                    <div class="glass-panel p-6 rounded-2xl">
                       <h3 class="text-white font-bold gaming-font text-xl mb-6 border-l-2 border-fuchsia-500 pl-3">CASTER INFO</h3>
                       <div class="flex flex-wrap gap-2">
                          @for (badge of u.badges; track badge) {
                             <span class="px-3 py-1 bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold rounded-lg">{{ badge }}</span>
                          }
                       </div>
                    </div>
                 }
                 
                 <!-- Social / Info -->
                 <div class="glass-panel p-6 rounded-2xl">
                    <h3 class="text-white font-bold gaming-font text-xl mb-6 border-l-2 border-white/20 pl-3">ABOUT</h3>
                    <div class="space-y-4 text-sm text-gray-400">
                       <div class="flex items-center gap-3">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <span>Joined Nov 2023</span>
                       </div>
                       <div class="flex items-center gap-3">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>Italy, Milan</span>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Right Column: Activity / Reviews -->
              <div class="lg:col-span-2 space-y-8">
                 
                 @if (u.role === 'caster') {
                    <div>
                        <h3 class="text-2xl gaming-font text-white mb-6">REVIEWS</h3>
                        <div class="space-y-4">
                           @for (review of reviews(); track review.id) {
                              <div class="glass-panel p-6 rounded-xl flex gap-4">
                                 <img [src]="review.avatar" class="w-12 h-12 rounded-full bg-gray-700 object-cover">
                                 <div>
                                    <div class="flex items-center gap-3 mb-1">
                                       <span class="font-bold text-white">{{ review.authorName }}</span>
                                       <div class="flex text-yellow-500 text-xs">
                                          @for (star of [1,2,3,4,5]; track star) {
                                             <span>{{ star <= review.rating ? '★' : '☆' }}</span>
                                          }
                                       </div>
                                    </div>
                                    <p class="text-gray-400 text-sm leading-relaxed">"{{ review.comment }}"</p>
                                 </div>
                              </div>
                           }
                           @if (reviews().length === 0) {
                              <div class="p-8 text-center border border-dashed border-white/10 rounded-xl text-gray-500">
                                 No reviews yet.
                              </div>
                           }
                        </div>
                    </div>
                 }

                 <!-- Recent Activity (Mock) -->
                 <div>
                    <h3 class="text-2xl gaming-font text-white mb-6">RECENT ACTIVITY</h3>
                    <div class="space-y-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                       <div class="p-4 bg-black/20 flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
                          <div class="text-sm text-gray-300">Participated in <span class="text-white font-bold">Cyber Winter Cup</span></div>
                          <div class="ml-auto text-xs text-gray-600 font-mono">2 days ago</div>
                       </div>
                       <div class="p-4 bg-black/20 flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div class="w-2 h-2 rounded-full bg-fuchsia-400"></div>
                          <div class="text-sm text-gray-300">Won match vs <span class="text-white font-bold">Glitch Mob</span></div>
                          <div class="ml-auto text-xs text-gray-600 font-mono">5 days ago</div>
                       </div>
                       <div class="p-4 bg-black/20 flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div class="w-2 h-2 rounded-full bg-green-400"></div>
                          <div class="text-sm text-gray-300">Reached <span class="text-white font-bold">Platinum Tier</span></div>
                          <div class="ml-auto text-xs text-gray-600 font-mono">1 week ago</div>
                       </div>
                    </div>
                 </div>

              </div>

           </div>

        </div>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center text-gray-500">User not found</div>
    }
  `
})
export class ProfileComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store = inject(StoreService);

  userId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  user = computed(() => this.store.getUserById(this.userId())());
  reviews = computed(() => this.store.getReviewsByCasterId(this.userId())());

  isCurrentUser = computed(() => {
     const currentUser = this.store.currentUser();
     const pageUser = this.user();
     return currentUser && pageUser && currentUser.id === pageUser.id;
  });

  // Editing State
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
