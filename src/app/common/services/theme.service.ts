import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

/**
 * @interface Theme
 * @description 
 * Rappresenta un "Vestito" per il tuo sito. 
 * Contiene un nome, un ID e una lista di colori (variabili CSS).
 */
export interface Theme {
  name: string;
  id: string;
  colors: { [key: string]: string };
  isCustom?: boolean; // Ci dice se è un tema creato dall'utente
}

/**
 * @class ThemeService
 * @description
 * Questo servizio è lo "Stylist" dell'applicazione.
 * Gestisce i temi pronti e quelli creati dall'utente, salvandoli nel browser.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly THEME_KEY = 'app-theme';
  private readonly CUSTOM_THEMES_KEY = 'app-saved-custom-themes';

  // Temi predefiniti (i nostri vestiti già pronti)
  private baseThemes: Theme[] = [
    {
      name: 'Coder (Acid Green)',
      id: 'coder',
      colors: { 
        '--color-primary': '115, 239, 105', 
        '--color-accent': '219, 39, 119', 
        '--color-text': '220, 220, 220', 
        '--color-bg-base': '15, 15, 20', 
        '--color-bg-surface': '25, 25, 35' 
      }
    },
    {
      name: 'Professional Blue',
      id: 'light',
      colors: { 
        '--color-primary': '79, 70, 229', 
        '--color-accent': '219, 39, 119', 
        '--color-text': '31, 41, 55', 
        '--color-bg-base': '243, 244, 246', 
        '--color-bg-surface': '255, 255, 255' 
      }
    },
    {
      name: 'Deep Dark',
      id: 'dark',
      colors: { 
        '--color-primary': '129, 140, 248', 
        '--color-accent': '244, 114, 182', 
        '--color-text': '229, 231, 235', 
        '--color-bg-base': '17, 24, 39', 
        '--color-bg-surface': '31, 41, 55' 
      }
    }
  ];

  // Lista dei temi creati dall'utente
  private customThemes: Theme[] = [];

  /**
   * Observable che dice a tutti quale tema è attivo.
   */
  public activeTheme$ = new BehaviorSubject<string>('coder');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCustomThemes();
      this.loadTheme();
    }
  }

  /**
   * Restituisce la lista di TUTTI i temi (quelli di base + quelli creati dall'utente).
   */
  getThemes(): Theme[] {
    return [...this.baseThemes, ...this.customThemes];
  }

  /**
   * Applica un tema specifico cercandolo per ID.
   */
  setTheme(themeId: string): void {
    const allThemes = this.getThemes();
    const theme = allThemes.find(t => t.id === themeId);
    
    if (!theme || !isPlatformBrowser(this.platformId)) return;

    this.applyColors(theme.colors);
    localStorage.setItem(this.THEME_KEY, themeId);
    this.activeTheme$.next(themeId);
  }

  /**
   * Crea un nuovo tema personalizzato e lo salva nel browser.
   */
  saveCustomTheme(name: string, colors: { [key: string]: string }): string {
    const id = 'custom-' + Date.now(); // ID unico basato sul tempo
    const newTheme: Theme = { name, id, colors, isCustom: true };
    
    this.customThemes.push(newTheme);
    this.persistCustomThemes();
    
    // Attiviamo subito il nuovo tema appena creato
    this.setTheme(id);
    return id;
  }

  /**
   * Modifica un tema esistente salvando i nuovi colori o il nuovo nome.
   */
  updateCustomTheme(themeId: string, name: string, colors: { [key: string]: string }): void {
    const index = this.customThemes.findIndex(t => t.id === themeId);
    if (index !== -1) {
      this.customThemes[index] = { ...this.customThemes[index], name, colors };
      this.persistCustomThemes();
      this.setTheme(themeId); // Riapplichiamo i colori aggiornati
    }
  }

  /**
   * Elimina un tema creato dall'utente.
   */
  deleteCustomTheme(themeId: string): void {
    this.customThemes = this.customThemes.filter(t => t.id !== themeId);
    this.persistCustomThemes();
    
    // Se stavamo usando proprio quel tema, torniamo a quello di base
    if (this.activeTheme$.value === themeId) {
      this.setTheme('coder');
    }
  }

  /**
   * Applica temporaneamente dei colori (utile per l'anteprima mentre li scegli).
   */
  previewColors(colors: { [key: string]: string }): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.applyColors(colors);
  }

  /**
   * Scrive i colori nelle variabili CSS del sito.
   */
  private applyColors(colors: { [key: string]: string }): void {
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  /**
   * Carica i temi dell'utente dal magazzino del browser (localStorage).
   */
  private loadCustomThemes(): void {
    const stored = localStorage.getItem(this.CUSTOM_THEMES_KEY);
    if (stored) {
      try {
        this.customThemes = JSON.parse(stored);
      } catch (e) {
        console.error('Errore nel caricamento dei temi personalizzati.');
      }
    }
  }

  /**
   * Salva la lista dei temi dell'utente nel magazzino del browser.
   */
  private persistCustomThemes(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CUSTOM_THEMES_KEY, JSON.stringify(this.customThemes));
    }
  }

  /**
   * Carica il tema che era attivo l'ultima volta.
   */
  private loadTheme(): void {
    const savedThemeId = localStorage.getItem(this.THEME_KEY) || 'coder';
    this.setTheme(savedThemeId);
  }
}
