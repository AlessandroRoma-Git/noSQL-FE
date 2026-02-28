
import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * @function authInterceptor
 * @description
 * Questo intercettore è come un "doganiere" per tutte le chiamate che il sito fa al server.
 * 1. Mette il timbro (Token JWT) su ogni richiesta per dire al server chi siamo.
 * 2. Controlla se il server risponde con un errore e ci avvisa con un messaggino (Toast).
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // --- STRUMENTI ---
  const authService = inject(AuthService); // Per prendere il token e fare logout
  const toastService = inject(ToastService); // Per mostrare i messaggi di errore

  // 1. PRENDIAMO IL TOKEN (il nostro passaporto)
  const token = authService.getToken();

  // Se abbiamo il token, lo aggiungiamo all'intestazione (Header) della chiamata
  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // 2. FACCIAMO LA CHIAMATA E CONTROLLIAMO COSA SUCCEDE
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se succede un errore, entriamo qui!
      let errorMessage = 'Si è verificato un errore imprevisto.';

      // Controlliamo il tipo di errore basandoci sul codice (Status)
      switch (error.status) {
        case 401:
          // 401 = Non sei autorizzato o il token è scaduto
          errorMessage = 'Sessione scaduta. Effettua nuovamente il login.';
          authService.logout(); // Ti buttiamo fuori per sicurezza
          break;
        case 403:
          // 403 = Non hai il permesso di fare questa cosa
          errorMessage = 'Non hai i permessi necessari per questa operazione.';
          break;
        case 404:
          // 404 = Quello che cerchi non esiste
          errorMessage = 'Risorsa non trovata sul server.';
          break;
        case 422:
          // 422 = Errore di validazione (es. hai scritto male un campo)
          errorMessage = error.error?.message || 'I dati inseriti non sono validi.';
          break;
        case 500:
          // 500 = Il server è esploso (errore interno)
          errorMessage = 'Errore interno del server. Riprova più tardi.';
          break;
        case 0:
          // 0 = Il server non risponde proprio (forse sei offline?)
          errorMessage = 'Impossibile contattare il server. Controlla la connessione.';
          break;
        default:
          // Altri errori generici
          errorMessage = error.error?.message || errorMessage;
      }

      // Mostriamo il messaggino rosso in alto a destra
      toastService.error(errorMessage);

      // Passiamo l'errore avanti nel caso qualche altro pezzo di codice voglia gestirlo
      return throwError(() => error);
    })
  );
};
