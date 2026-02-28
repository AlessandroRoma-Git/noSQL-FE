import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ModalService } from './modal.service';

/**
 * @class I18nService
 * @description
 * Questo servizio gestisce la lingua del sito. È come un traduttore automatico:
 * carica dei file JSON che contengono le traduzioni per ogni lingua (es. it.json, en.json)
 * e ci permette di recuperare la frase corretta in base alla lingua scelta.
 */
@Injectable({
  providedIn: 'root'
})
export class I18nService {
  // Usiamo HttpClient per leggere i file JSON dalla cartella assets
  private http = inject(HttpClient);
  private modalService = inject(ModalService);

  // Qui salviamo tutte le parole tradotte della lingua attuale
  private translationsSubject = new BehaviorSubject<any>({});
  public translations$ = this.translationsSubject.asObservable();

  // Qui salviamo qual è la lingua attiva al momento (es: 'en')
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  /**
   * Cambia la lingua dell'applicazione.
   */
  async setLanguage(lang: string): Promise<void> {
    try {
      const translations = await firstValueFrom(this.http.get(`assets/i18n/${lang}.json`));
      this.translationsSubject.next(translations);
      this.currentLangSubject.next(lang);
      localStorage.setItem('app_lang', lang);
      console.log(`Lingua impostata su: ${lang}`);
    } catch (error) {
      console.error(`Impossibile caricare la lingua ${lang}.`, error);
    }
  }

  /**
   * Recupera una parola o una frase tradotta.
   */
  translate(key: string): string {
    const keys = key.split('.');
    let result = this.translationsSubject.value;

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key; 
      }
    }
    return result;
  }

  /**
   * Mostra una spiegazione "For Dummies" per un campo specifico.
   * @param fieldKey La chiave dentro FIELDS_HELP (es: 'ENTITY_KEY')
   */
  showFieldHelp(fieldKey: string): void {
    const title = this.translate('COMMON.MORE');
    const message = this.translate(`FIELDS_HELP.${fieldKey}`);
    this.modalService.openInfo(title, message);
  }
}
