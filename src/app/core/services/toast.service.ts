import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * @interface ToastMessage
 * @description
 * Immagina questo come un "post-it" digitale. 
 * Contiene il testo da mostrare, il colore (successo, errore, info) 
 * e per quanto tempo deve restare sullo schermo.
 */
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

/**
 * @class ToastService
 * @description
 * Questo servizio è il "postino" delle notifiche veloci (Toast).
 * Serve per far apparire quei messaggini che compaiono in un angolo e spariscono da soli.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Una lista (array) che tiene traccia di tutti i messaggi visibili al momento
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private counter = 0; // Serve per dare un numero unico (ID) a ogni messaggio

  /**
   * Mostra un messaggio di Errore (Rosso).
   */
  error(message: string, duration = 5000) {
    this.show(message, 'error', duration);
  }

  /**
   * Mostra un messaggio di Successo (Verde).
   */
  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  /**
   * Mostra un messaggio Informativo (Blu).
   */
  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  /**
   * Metodo principale per creare e mostrare la notifica.
   */
  private show(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number) {
    const id = this.counter++; // Creiamo un nuovo ID unico
    const toast: ToastMessage = { id, message, type, duration };

    // Aggiungiamo il nuovo messaggio alla lista di quelli già presenti
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Impostiamo un "timer" per far sparire il messaggio dopo tot secondi
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  /**
   * Rimuove un messaggio dalla lista (lo fa sparire dallo schermo).
   */
  remove(id: number) {
    const currentToasts = this.toastsSubject.value;
    // Filtriamo la lista togliendo quello con l'ID indicato
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }
}
