import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThemeService } from './theme.service';
import { I18nService } from './i18n.service';

/**
 * @interface WhiteLabelConfig
 * @description
 * Immagina questa come la "carta d'identità" visiva del prodotto.
 * Definisce il logo, il nome dell'app, la lingua e il tema.
 * È utile per creare versioni diverse dello stesso prodotto (es. un CMS per l'Azienda A, uno per l'Azienda B).
 */
export interface WhiteLabelConfig {
  logoUrl: string;
  appName: string;
  language: string;
  themeId: string;
}

/**
 * Valori di base se non troviamo nulla nei file JSON o nel browser.
 */
const DEFAULT_CONFIG: WhiteLabelConfig = {
  logoUrl: '',
  appName: 'CMS NoSQL',
  language: 'en',
  themeId: 'coder'
};

/**
 * @class WhiteLabelService
 * @description
 * Questo servizio è il "regista" dell'aspetto e della lingua del sito.
 * Legge le impostazioni dai file JSON e decide come deve apparire il portale
 * (colore, logo, nome) e in che lingua deve parlare.
 */
@Injectable({
  providedIn: 'root'
})
export class WhiteLabelService {
  // Chiave segreta per salvare le preferenze nel browser
  private readonly STORAGE_KEY = 'app_whitelabel_config';
  
  // Iniettiamo i vari strumenti che ci servono
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private i18nService = inject(I18nService);

  // BehaviorSubject è un contenitore che tiene la configurazione attuale.
  // Chiunque può iscriversi e ricevere aggiornamenti se cambiamo qualcosa.
  private configSubject = new BehaviorSubject<WhiteLabelConfig>(DEFAULT_CONFIG);
  public config$ = this.configSubject.asObservable();

  constructor() {
    // Quando il servizio nasce, cerchiamo di caricare subito le impostazioni
    if (isPlatformBrowser(this.platformId)) {
      this.initWhiteLabel();
    }
  }

  /**
   * Metodo per inizializzare il servizio all'avvio dell'app.
   * @description
   * 1. Cerca nel browser se l'utente ha salvato preferenze vecchie.
   * 2. Legge il file JSON di configurazione principale (assets/config/app-config.json).
   * 3. Applica il tema e la lingua scelti.
   */
  private async initWhiteLabel(): Promise<void> {
    try {
      // Step 1: Proviamo a leggere il file JSON dal server
      const configJson = await this.http.get<any>('assets/config/app-config.json').toPromise();
      const branding = configJson?.branding || {};
      
      // Step 2: Vediamo se ci sono preferenze salvate nel browser dell'utente (hanno la precedenza sul JSON)
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let localConfig = {};
      if (stored) {
        try {
          localConfig = JSON.parse(stored);
        } catch (e) {
          console.error('Errore nel leggere le preferenze salvate. Forse sono corrotte?');
        }
      }

      // Step 3: Fondiamo tutto insieme: Valori di base + JSON + Preferenze Browser
      const finalConfig: WhiteLabelConfig = {
        ...DEFAULT_CONFIG,
        ...branding,
        ...localConfig
      };

      // Step 4: Diciamo a tutti che questa è la nuova configurazione ufficiale
      this.configSubject.next(finalConfig);
      
      // Step 5: Applichiamo concretamente il tema e la lingua scelti
      if (finalConfig.themeId) {
        this.themeService.setTheme(finalConfig.themeId);
      }
      
      if (finalConfig.language) {
        this.i18nService.setLanguage(finalConfig.language);
      }

      console.log('Servizio White Label inizializzato correttamente!', finalConfig);

    } catch (e) {
      console.error('Impossibile caricare il file app-config.json. Uso i valori di default.', e);
      // Se fallisce il caricamento del JSON, proviamo comunque a impostare lingua e tema di base
      this.i18nService.setLanguage(DEFAULT_CONFIG.language);
      this.themeService.setTheme(DEFAULT_CONFIG.themeId);
    }
  }

  /**
   * Cambia una o più impostazioni della marca (logo, nome app, lingua, tema).
   * @param newConfig Le nuove impostazioni (puoi passarne anche solo una!)
   * @description
   * Se chiami questo metodo per cambiare, ad esempio, la lingua,
   * il servizio aggiorna tutto il sito e salva la scelta nel browser.
   */
  updateConfig(newConfig: Partial<WhiteLabelConfig>) {
    // Prendiamo la configurazione attuale
    const current = this.configSubject.value;
    
    // Creiamo quella aggiornata mescolando la vecchia con le novità
    const updated = { ...current, ...newConfig };
    
    // Distribuiamo la notizia a tutto il sito
    this.configSubject.next(updated);
    
    // Se è cambiato il tema, applichiamolo subito
    if (newConfig.themeId) {
      this.themeService.setTheme(newConfig.themeId);
    }

    // Se è cambiata la lingua, carichiamo le nuove parole
    if (newConfig.language) {
      this.i18nService.setLanguage(newConfig.language);
    }
    
    // Salviamo per il futuro nel browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }
  }
}
