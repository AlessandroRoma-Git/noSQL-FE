
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  name: string;
  id: string;
  colors: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly THEME_KEY = 'app-theme';

  private themes: Theme[] = [
    // Original Themes
    {
      name: 'Coder',
      id: 'coder',
      colors: { '--color-primary': '115, 239, 105', '--color-accent': '219, 39, 119', '--color-text': '115, 239, 105', '--color-bg-base': '0, 0, 0', '--color-bg-surface': '31, 41, 55' }
    },
    {
      name: 'Light',
      id: 'light',
      colors: { '--color-primary': '79, 70, 229', '--color-accent': '219, 39, 119', '--color-text': '31, 41, 55', '--color-bg-base': '243, 244, 246', '--color-bg-surface': '255, 255, 255' }
    },
    {
      name: 'Dark',
      id: 'dark',
      colors: { '--color-primary': '129, 140, 248', '--color-accent': '244, 114, 182', '--color-text': '229, 231, 235', '--color-bg-base': '17, 24, 39', '--color-bg-surface': '31, 41, 55' }
    },
    {
      name: 'Ocean',
      id: 'ocean',
      colors: { '--color-primary': '56, 189, 248', '--color-accent': '34, 211, 238', '--color-text': '224, 231, 255', '--color-bg-base': '15, 23, 42', '--color-bg-surface': '30, 41, 59' }
    },
    {
      name: 'Forest',
      id: 'forest',
      colors: { '--color-primary': '52, 211, 153', '--color-accent': '245, 158, 11', '--color-text': '209, 213, 219', '--color-bg-base': '20, 30, 20', '--color-bg-surface': '31, 41, 55' }
    },
    {
      name: 'Rose',
      id: 'rose',
      colors: { '--color-primary': '244, 63, 94', '--color-accent': '139, 92, 246', '--color-text': '55, 65, 81', '--color-bg-base': '249, 250, 251', '--color-bg-surface': '255, 255, 255' }
    },
    // 10 New Themes
    {
      name: 'Dracula',
      id: 'dracula',
      colors: { '--color-primary': '255, 121, 198', '--color-accent': '139, 233, 253', '--color-text': '248, 248, 242', '--color-bg-base': '40, 42, 54', '--color-bg-surface': '68, 71, 90' }
    },
    {
      name: 'Solarized Dark',
      id: 'solarized-dark',
      colors: { '--color-primary': '181, 137, 0', '--color-accent': '203, 75, 22', '--color-text': '131, 148, 150', '--color-bg-base': '0, 43, 54', '--color-bg-surface': '7, 54, 66' }
    },
    {
      name: 'Nord',
      id: 'nord',
      colors: { '--color-primary': '136, 192, 208', '--color-accent': '191, 97, 106', '--color-text': '216, 222, 233', '--color-bg-base': '46, 52, 64', '--color-bg-surface': '59, 66, 82' }
    },
    {
      name: 'Gruvbox Dark',
      id: 'gruvbox-dark',
      colors: { '--color-primary': '250, 189, 47', '--color-accent': '131, 165, 152', '--color-text': '235, 219, 178', '--color-bg-base': '29, 32, 33', '--color-bg-surface': '40, 40, 40' }
    },
    {
      name: 'Cyberpunk',
      id: 'cyberpunk',
      colors: { '--color-primary': '247, 255, 0', '--color-accent': '0, 255, 255', '--color-text': '247, 255, 0', '--color-bg-base': '10, 0, 30', '--color-bg-surface': '25, 5, 55' }
    },
    {
      name: 'Sunset',
      id: 'sunset',
      colors: { '--color-primary': '255, 165, 0', '--color-accent': '227, 61, 153', '--color-text': '255, 228, 196', '--color-bg-base': '25, 20, 35', '--color-bg-surface': '45, 30, 55' }
    },
    {
      name: 'Terminal',
      id: 'terminal',
      colors: { '--color-primary': '255, 198, 0', '--color-accent': '0, 255, 0', '--color-text': '255, 198, 0', '--color-bg-base': '0, 0, 0', '--color-bg-surface': '20, 20, 20' }
    },
    {
      name: 'Matcha',
      id: 'matcha',
      colors: { '--color-primary': '107, 143, 102', '--color-accent': '195, 169, 130', '--color-text': '77, 77, 77', '--color-bg-base': '244, 241, 234', '--color-bg-surface': '255, 255, 255' }
    },
    {
      name: 'Volcano',
      id: 'volcano',
      colors: { '--color-primary': '255, 107, 0', '--color-accent': '255, 0, 0', '--color-text': '255, 204, 153', '--color-bg-base': '18, 18, 18', '--color-bg-surface': '44, 33, 30' }
    },
    {
      name: 'Monochrome',
      id: 'monochrome',
      colors: { '--color-primary': '200, 200, 200', '--color-accent': '150, 150, 150', '--color-text': '220, 220, 220', '--color-bg-base': '10, 10, 10', '--color-bg-surface': '30, 30, 30' }
    }
  ];

  public activeTheme$ = new BehaviorSubject<string>('coder');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
    }
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  setTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme || !isPlatformBrowser(this.platformId)) {
      return;
    }

    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    localStorage.setItem(this.THEME_KEY, themeId);
    this.activeTheme$.next(themeId);
  }

  private loadTheme(): void {
    const savedThemeId = localStorage.getItem(this.THEME_KEY) || 'coder';
    this.setTheme(savedThemeId);
  }
}
