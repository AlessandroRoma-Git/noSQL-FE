
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  public authService = inject(AuthService);
  private themeService = inject(ThemeService); // Service is injected but non-operational
  public isSidebarOpen = true;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}
