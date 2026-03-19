import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-omnium-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-[#050505] text-white selection:bg-cyan-500 selection:text-black">
      <!-- Deep dark background with subtle pulse -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div class="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-fuchsia-500/5 rounded-full blur-[150px]"></div>
      </div>

      <!-- Main Content Area (Full Width) -->
      <main class="w-full min-h-screen">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class OmniumLayoutComponent {}
