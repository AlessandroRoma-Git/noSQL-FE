import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

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

  // Qui salviamo tutte le parole tradotte della lingua attuale
  // Usiamo un BehaviorSubject così chiunque nel sito può "ascoltare" quando la lingua cambia
  private translationsSubject = new BehaviorSubject<any>({});
  public translations$ = this.translationsSubject.asObservable();

  // Qui salviamo qual è la lingua attiva al momento (es: 'en')
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  /**
   * Cambia la lingua dell'applicazione.
   * @param lang La sigla della lingua (es: 'it', 'en')
   * @description
   * Quando chiami questo metodo, il servizio va a cercare il file corrispondente
   * nella cartella /assets/i18n/ e aggiorna tutto il sito.
   */
  async setLanguage(lang: string): Promise<void> {
    try {
      // Chiediamo al server il file delle traduzioni (es: assets/i18n/it.json)
      const translations = await firstValueFrom(this.http.get(`assets/i18n/${lang}.json`));
      
      // Se lo troviamo, aggiorniamo i nostri "contenitori" con i nuovi dati
      this.translationsSubject.next(translations);
      this.currentLangSubject.next(lang);
      
      // Salviamo la preferenza dell'utente nel browser così se ricarica la pagina non la perde
      localStorage.setItem('app_lang', lang);
      
      console.log(`Lingua impostata su: ${lang}`);
    } catch (error) {
      console.error(`Impossibile caricare la lingua ${lang}. Forse il file JSON manca?`, error);
    }
  }

  /**
   * Recupera una parola o una frase tradotta.
   * @param key La "chiave" della parola (es: 'COMMON.SAVE')
   * @returns La parola tradotta (es: 'Salva') o la chiave stessa se non trova nulla
   * @description
   * Questo metodo serve per dire: "Ehi, dammi la traduzione per questa chiave".
   * Se la chiave è dentro un oggetto (es: COMMON.WELCOME), il metodo scava nel JSON per trovarla.
   */
  translate(key: string): string {
    const keys = key.split('.'); // Dividiamo la chiave se è tipo "OGGETTO.PAROLA"
    let result = this.translationsSubject.value;

    // Navighiamo dentro l'oggetto JSON per trovare la parola finale
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        // Se non troviamo la traduzione, restituiamo la chiave originale per non lasciare il testo vuoto
        return key; 
      }
    }

    return result;
  }
}
