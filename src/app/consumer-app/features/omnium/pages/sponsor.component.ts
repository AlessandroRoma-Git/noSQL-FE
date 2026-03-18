import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-sponsor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20">
      
      <div class="text-center mb-20">
        <h1 class="text-5xl md:text-7xl gaming-font text-white mb-4">OUR PARTNERS</h1>
        <p class="text-gray-400">Powering the future of esports.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
         @for (sponsor of store.sponsors(); track sponsor.id) {
            <div class="glass-panel p-8 rounded-3xl text-center group hover:bg-white/5 transition-all">
               <div class="h-32 flex items-center justify-center mb-8 p-4 bg-white/5 rounded-2xl">
                  <img [src]="sponsor.logo" class="max-h-full max-w-full grayscale group-hover:grayscale-0 transition-all duration-500">
               </div>
               
               <h2 class="text-3xl font-bold text-white gaming-font mb-4">{{ sponsor.name }}</h2>
               <p class="text-gray-400 mb-8 max-w-md mx-auto">{{ sponsor.description }}</p>
               
               <a [href]="sponsor.siteUrl" class="inline-block px-8 py-3 rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold text-sm transition-all uppercase tracking-widest">
                  Visit Website
               </a>
            </div>
         }
      </div>

      <!-- Call to action -->
      <div class="mt-32 p-12 glass-panel rounded-3xl text-center border border-fuchsia-500/20 bg-gradient-to-b from-fuchsia-900/10 to-transparent">
         <h3 class="text-3xl font-bold text-white gaming-font mb-4">BECOME A SPONSOR</h3>
         <p class="text-gray-400 mb-8">Join the OMNIUM ecosystem and reach millions of gamers worldwide.</p>
         <button class="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            CONTACT US
         </button>
      </div>

    </div>
  `
})
export class SponsorComponent {
  store = inject(StoreService);
}