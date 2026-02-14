
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ThemeService, Theme } from './core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  public authService = inject(AuthService);
  private themeService = inject(ThemeService);
  public isSidebarOpen = true;

  public themes: Theme[] = [];
  public activeTheme$: Observable<string>;

  constructor() {
    this.themes = this.themeService.getThemes();
    this.activeTheme$ = this.themeService.activeTheme$;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onThemeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.themeService.setTheme(selectElement.value);
  }

  logout(): void {
    this.authService.logout();
  }
}
