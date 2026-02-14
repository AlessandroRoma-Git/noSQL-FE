
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || 'theme-coder';
    this.setTheme(savedTheme);
  }

  setTheme(themeName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.className = themeName;
      localStorage.setItem(this.THEME_KEY, themeName);
    }
  }
}
