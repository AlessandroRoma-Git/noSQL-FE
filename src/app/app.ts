
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ThemeService, Theme } from './core/services/theme.service';
import { MenuService } from './core/services/menu.service';
import { WhiteLabelService, WhiteLabelConfig } from './core/services/white-label.service';
import { I18nService } from './core/services/i18n.service';
import { Observable, combineLatest } from 'rxjs';
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
  // --- INIEZIONE SERVIZI (i nostri strumenti) ---
  public authService = inject(AuthService); // Gestisce chi entra ed esce
  public i18nService = inject(I18nService); // Il nostro traduttore personale
  private themeService = inject(ThemeService); // Si occupa dei colori
  private menuService = inject(MenuService); // Carica i menu dal server
  private whiteLabelService = inject(WhiteLabelService); // Gestisce la "marca" (logo, nome)

  // --- VARIABILI DI STATO (quello che succede nell'app) ---
  public isSidebarOpen = true; // La barra laterale è aperta?

  // --- CANALI DI DATI (Observable) ---
  public themes: Theme[] = []; // Elenco dei colori disponibili
  public activeTheme$: Observable<string>; // Quale colore stiamo usando ora?
  public whiteLabelConfig$: Observable<WhiteLabelConfig>; // Logo e nome dell'app
  public userMenuItems$: Observable<MenuItem[]>; // Voci del menu per l'utente loggato
  public isAdmin$: Observable<boolean>; // L'utente è un Capo (Admin)?

  constructor() {
    // 1. Carichiamo tutti i colori disponibili
    this.themes = this.themeService.getThemes();
    
    // 2. Teniamo d'occhio il colore attuale
    this.activeTheme$ = this.themeService.activeTheme$;
    
    // 3. Teniamo d'occhio il logo e il nome dell'app
    this.whiteLabelConfig$ = this.whiteLabelService.config$;
    
    // 4. Teniamo d'occhio le voci del menu che l'utente può vedere
    this.userMenuItems$ = this.menuService.userMenuItems$;
    
    // 5. Controlliamo se chi è loggato è un Admin o un Super Admin
    this.isAdmin$ = this.authService.systemRoles$.pipe(
      map(roles => roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))
    );
  }

  /**
   * Questo pezzo di codice viene eseguito appena il sito si accende.
   */
  ngOnInit() {
    // Invece di guardare tanti piccoli pezzi separati, guardiamo lo "Stato Utente" intero.
    // Questo evita che il sito si confonda facendo chiamate al server nel momento sbagliato.
    this.authService.userState$.subscribe(state => {
      const isAuthenticated = !!state?.token;
      const isFirstAccess = state?.firstAccess ?? false;

      // Carichiamo il menu SOLO se l'utente è loggato E ha già cambiato la password.
      if (isAuthenticated && !isFirstAccess) {
        console.log('Utente operativo: carico i menu dinamici.');
        this.menuService.loadUserMenu().subscribe();
      } else if (isAuthenticated && isFirstAccess) {
        console.log('Accesso obbligatorio: menu bloccati finché la password non viene cambiata.');
      }
    });
  }

  /**
   * Apre o chiude la barra laterale quando clicchi sul bottone.
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Cambia il colore del sito quando ne scegli uno dalla lista.
   */
  onThemeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.whiteLabelService.updateConfig({ themeId: selectElement.value });
  }

  /**
   * Cambia la lingua del sito quando clicchi sulla bandierina o scegli la lingua.
   */
  onLangChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.whiteLabelService.updateConfig({ language: selectElement.value });
  }

  /**
   * Chiude la sessione e ci riporta al login.
   */
  logout(): void {
    this.authService.logout();
  }
}
