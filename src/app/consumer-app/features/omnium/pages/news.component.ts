import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-32 px-6 max-w-7xl mx-auto pb-20">
      
      <div class="text-center mb-16">
        <h1 class="text-6xl gaming-font text-white mb-4">LATEST INTEL</h1>
        <p class="text-gray-400">Aggiornamenti dal fronte, patch notes e highlights della community.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (item of store.news(); track item.id) {
          <div class="glass-panel p-1 rounded-2xl group hover:border-cyan-500/30 transition-all duration-300">
             <div class="bg-black/40 rounded-xl overflow-hidden h-full flex flex-col">
                <div class="relative h-48 overflow-hidden">
                   <img [src]="item.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="News Image">
                   <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-cyan-400 border border-cyan-500/20">
                      {{ item.date }}
                   </div>
                </div>
                
                <div class="p-6 flex flex-col flex-grow">
                   <h2 class="text-2xl gaming-font text-white mb-3 group-hover:text-cyan-400 transition-colors leading-tight">
                      {{ item.title }}
                   </h2>
                   <p class="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                      {{ item.excerpt }}
                   </p>
                   
                   <button class="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-widest transition-all">
                      Read More
                   </button>
                </div>
             </div>
          </div>
        }
      </div>

    </div>
  `
})
export class NewsComponent {
  store = inject(StoreService);
}