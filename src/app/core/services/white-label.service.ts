import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { ThemeService } from './theme.service';
import { I18nService } from './i18n.service';

/**
 * @interface WhiteLabelConfig
 * @description
 * Immagina questa come la "carta d'identità" visiva del prodotto.
 */
export interface WhiteLabelConfig {
  logoUrl: string;
  appName: string;
  language: string;
  themeId: string;
  // Ora possiamo decidere come deve apparire il menu in base a quanto è grande lo schermo!
  layoutMode: 'sidebar' | 'navbar' | 'bottom-nav' | 'tabs' | 'floating';
  // Impostazioni di base per ogni dispositivo
  defaults: {
    desktop: 'sidebar' | 'navbar' | 'bottom-nav' | 'tabs' | 'floating';
    tablet: 'sidebar' | 'navbar' | 'bottom-nav' | 'tabs' | 'floating';
    mobile: 'sidebar' | 'navbar' | 'bottom-nav' | 'tabs' | 'floating';
  }
}

const DEFAULT_CONFIG: WhiteLabelConfig = {
  logoUrl: 'assets/logo.svg',
  appName: 'CMS NoSQL',
  language: 'en',
  themeId: 'coder',
  layoutMode: 'sidebar',
  defaults: {
    desktop: 'sidebar',
    tablet: 'navbar',
    mobile: 'bottom-nav'
  }
};

/**
 * @class WhiteLabelService
 * @description
 * Questo servizio gestisce l'aspetto del sito. 
 * È intelligente: capisce se stai usando un PC, un Tablet o un Telefonino 
 * e sceglie il menu più comodo per te in base alle tue preferenze.
 */
@Injectable({
  providedIn: 'root'
})
export class WhiteLabelService {
  private readonly STORAGE_KEY = 'app_whitelabel_config';
  
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private i18nService = inject(I18nService);

  private configSubject = new BehaviorSubject<WhiteLabelConfig>(DEFAULT_CONFIG);
  public config$ = this.configSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initWhiteLabel();
      this.listenToResize();
    }
  }

  /**
   * Ascolta quando allarghi o stringi la finestra del browser.
   */
  private listenToResize(): void {
    fromEvent(window, 'resize').pipe(
      debounceTime(200), // Aspetta un attimo che l'utente finisca di muovere
      startWith(null)
    ).subscribe(() => {
      this.applyDeviceLayout();
    });
  }

  /**
   * Decide quale layout usare basandosi sulla larghezza dello schermo.
   */
  private applyDeviceLayout(): void {
    const width = window.innerWidth;
    const currentConfig = this.configSubject.value;
    let newMode: WhiteLabelConfig['layoutMode'];

    if (width >= 1024) {
      // Desktop (Grande)
      newMode = currentConfig.defaults.desktop;
    } else if (width >= 768) {
      // Tablet (Medio)
      newMode = currentConfig.defaults.tablet;
    } else {
      // Mobile (Piccolo)
      newMode = currentConfig.defaults.mobile;
    }

    if (newMode !== currentConfig.layoutMode) {
      console.log(`Cambio layout automatico per il dispositivo: ${newMode}`);
      this.configSubject.next({ ...currentConfig, layoutMode: newMode });
    }
  }

  private async initWhiteLabel(): Promise<void> {
    try {
      const configJson = await this.http.get<any>('assets/config/app-config.json').toPromise();
      const branding = configJson?.branding || {};
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let localConfig = {};
      if (stored) {
        try {
          localConfig = JSON.parse(stored);
        } catch (e) {}
      }

      const finalConfig: WhiteLabelConfig = {
        ...DEFAULT_CONFIG,
        ...branding,
        ...localConfig
      };

      this.configSubject.next(finalConfig);
      this.themeService.setTheme(finalConfig.themeId);
      this.i18nService.setLanguage(finalConfig.language);
      
      // Applichiamo subito il layout giusto per il dispositivo attuale
      this.applyDeviceLayout();

    } catch (e) {
      this.i18nService.setLanguage(DEFAULT_CONFIG.language);
      this.themeService.setTheme(DEFAULT_CONFIG.themeId);
    }
  }

  /**
   * Aggiorna le impostazioni e salva nel browser.
   */
  updateConfig(newConfig: Partial<WhiteLabelConfig>) {
    const current = this.configSubject.value;
    const updated = { ...current, ...newConfig };
    
    this.configSubject.next(updated);
    
    if (newConfig.themeId) this.themeService.setTheme(newConfig.themeId);
    if (newConfig.language) this.i18nService.setLanguage(newConfig.language);
    
    // Se cambiamo i default dei dispositivi, ri-applichiamo subito quello corrente
    if (newConfig.defaults) {
      this.applyDeviceLayout();
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }
  }
}
