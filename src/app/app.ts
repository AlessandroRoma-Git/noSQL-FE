import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ThemeService, Theme } from './core/services/theme.service';
import { MenuService } from './core/services/menu.service';
import { WhiteLabelService, WhiteLabelConfig } from './core/services/white-label.service';
import { I18nService } from './core/services/i18n.service';
import { Observable, filter } from 'rxjs';
import { MenuItem } from './core/models/menu-item.model';
import { map } from 'rxjs/operators';

/**
 * @class App
 * @description
 * Questa è la "casa" di tutto il sito. Qui gestiamo la barra laterale (sidebar), 
 * il tema scuro o chiaro, la lingua e chi può vedere cosa nel menu.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ModalComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  // --- INIEZIONE SERVIZI ---
  public authService = inject(AuthService);
  public i18nService = inject(I18nService);
  private themeService = inject(ThemeService);
  private menuService = inject(MenuService);
  private whiteLabelService = inject(WhiteLabelService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // --- VARIABILI DI STATO ---
  public isSidebarOpen = true;

  // --- CANALI DI DATI ---
  public themes: Theme[] = [];
  public activeTheme$: Observable<string>;
  public whiteLabelConfig$: Observable<WhiteLabelConfig>;
  public userMenuItems$: Observable<MenuItem[]>;
  public isAdmin$: Observable<boolean>;

  constructor() {
    this.themes = this.themeService.getThemes();
    this.activeTheme$ = this.themeService.activeTheme$;
    this.whiteLabelConfig$ = this.whiteLabelService.config$;
    this.userMenuItems$ = this.menuService.userMenuItems$;
    this.isAdmin$ = this.authService.systemRoles$.pipe(
      map(roles => roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))
    );

    // Se l'utente clicca su un link da cellulare, chiudiamo automaticamente il menu
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (isPlatformBrowser(this.platformId) && window.innerWidth < 768) {
        this.isSidebarOpen = false;
      }
    });
  }

  ngOnInit() {
    this.authService.userState$.subscribe(state => {
      const isAuthenticated = !!state?.token;
      const isFirstAccess = state?.firstAccess ?? false;

      if (isAuthenticated && !isFirstAccess) {
        this.menuService.loadUserMenu().subscribe();
      }
    });

    // Se cambiamo tipo di layout, resettiamo lo stato della sidebar
    this.whiteLabelConfig$.subscribe(config => {
      if (config.layoutMode !== 'sidebar' && config.layoutMode !== 'bottom-nav') {
        this.isSidebarOpen = false;
      }
    });
  }

  /**
   * Apre o chiude la barra laterale.
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onThemeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.whiteLabelService.updateConfig({ themeId: selectElement.value });
  }

  onLangChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.whiteLabelService.updateConfig({ language: selectElement.value });
  }

  logout(): void {
    this.authService.logout();
  }
}
