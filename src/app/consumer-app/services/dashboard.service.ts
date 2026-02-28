import { environment } from 'src/environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * @interface DashboardStat
 * @description Una singola figurina della dashboard con il totale dei dati.
 */
export interface DashboardStat {
  entityKey: string;
  label: string;
  count: number;
}

/**
 * @class DashboardService
 * @description
 * Questo servizio è il "contabile" della dashboard.
 * Tiene a mente quali tabelle l'utente vuole vedere nella pagina principale
 * e va a contare quanti record ci sono per ognuna.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'app_dashboard_config';
  private readonly RECORDS_API = environment.apiUrl + '/records';

  // Liste delle tabelle da mostrare (salvata nel browser per ora)
  private configSubject = new BehaviorSubject<string[]>([]);
  public config$ = this.configSubject.asObservable();

  constructor() {
    this.loadConfig();
  }

  /**
   * Carica la lista delle tabelle preferite dal browser.
   */
  private loadConfig(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.configSubject.next(JSON.parse(stored));
    } else {
      // Se è la prima volta, non mostriamo nulla o mettiamo dei default
      this.configSubject.next([]);
    }
  }

  /**
   * Salva la lista delle tabelle preferite nel browser.
   */
  saveConfig(keys: string[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    this.configSubject.next(keys);
  }

  /**
   * Recupera il totale dei record per una specifica tabella.
   * @description Sfrutta la ricerca con size 1 per ottenere il totalElements.
   */
  getEntityCount(entityKey: string): Observable<number> {
    const body = { filters: [], sorts: [], page: 0, size: 1 };
    return this.http.post<any>(`${this.RECORDS_API}/${entityKey}/search`, body).pipe(
      map(res => res.totalElements || 0),
      catchError(() => of(0)) // Se c'è un errore (es. non hai permessi), restituiamo 0
    );
  }

  /**
   * Recupera i dati per tutte le tabelle configurate.
   */
  getDashboardStats(entities: {key: string, label: string}[]): Observable<DashboardStat[]> {
    const activeKeys = this.configSubject.value;
    const selectedEntities = entities.filter(e => activeKeys.includes(e.key));
    
    if (selectedEntities.length === 0) return of([]);

    // Facciamo tante chiamate parallele, una per ogni tabella scelta
    const requests = selectedEntities.map(entity => 
      this.getEntityCount(entity.key).pipe(
        map(count => ({ entityKey: entity.key, label: entity.label, count }))
      )
    );

    return forkJoin(requests);
  }
}
