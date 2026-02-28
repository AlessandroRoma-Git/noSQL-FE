
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CmsSettings } from '../models/settings.model';

/**
 * @class SettingsService
 * @description
 * Questo servizio gestisce le "Impostazioni Globali" del sistema.
 * Immaginalo come il pannello di controllo del tuo smartphone: 
 * qui decidiamo quanto deve essere grande un file caricato, 
 * quante volte si può sbagliare la password, ecc.
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Indirizzo del file JSON dove teniamo scritte le impostazioni
  private readonly configUrl = 'assets/config/app-config.json';
  
  // HttpClient è lo strumento che usiamo per fare domande al server e leggere file
  private http = inject(HttpClient);

  /**
   * Recupera tutte le impostazioni dal file JSON.
   * @returns Un "canale" (Observable) che emetterà le impostazioni quando il file è stato letto.
   * @description
   * Questo metodo va a leggere il file 'assets/config/app-config.json' 
   * e ci restituisce i dati pronti per essere usati nelle pagine del sito.
   */
  getSettings(): Observable<CmsSettings> {
    console.log('Recupero le impostazioni dal file JSON...');
    
    // Leggiamo il file e lo trasformiamo nel formato CmsSettings
    return this.http.get<any>(this.configUrl).pipe(
      map(config => {
        // Estraiamo solo le parti che ci servono per le impostazioni globali
        return {
          email: config.email,
          security: config.security,
          storage: config.storage
        } as CmsSettings;
      })
    );
  }

  /**
   * Aggiorna le impostazioni del sistema.
   * @param settings Il nuovo pacchetto di impostazioni da salvare.
   * @returns Un canale che conferma il salvataggio.
   * @description
   * ATTENZIONE: Al momento, siccome stiamo leggendo un file JSON fisso, 
   * questo metodo simula solo il salvataggio. In futuro, invierà i dati al backend 
   * per salvarli nel Database MongoDB.
   */
  updateSettings(settings: CmsSettings): Observable<CmsSettings> {
    console.log('Simulazione salvataggio impostazioni:', settings);
    
    // Per ora facciamo finta che tutto sia andato bene e restituiamo gli stessi dati
    // (In futuro qui ci sarà una chiamata "PUT" al server vero)
    return new Observable(subscriber => {
      setTimeout(() => {
        subscriber.next(settings);
        subscriber.complete();
      }, 500); // Facciamo finta che il server ci metta mezzo secondo a rispondere
    });
  }
}
