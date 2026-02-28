import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

/**
 * @function authGuard
 * @description
 * Questo guard è il "buttafuori" del sito. 
 * Controlla due cose:
 * 1. Se sei loggato.
 * 2. Se è la tua prima volta (firstAccess). In quel caso, ti scorta a forza 
 *    nella pagina di cambio password e non ti fa uscire finché non l'hai cambiata!
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return combineLatest([
    authService.isAuthenticated$,
    authService.isFirstAccess$
  ]).pipe(
    take(1),
    map(([isAuthenticated, isFirstAccess]) => {
      // 1. Se non sei loggato, vai al login
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }

      // 2. Se devi cambiare password (firstAccess = true)
      if (isFirstAccess) {
        // Se non sei già sulla pagina di cambio password, ti ci porto io!
        if (state.url !== '/change-password') {
          console.log('Accesso obbligatorio: devi cambiare la password prima di continuare.');
          router.navigate(['/change-password']);
          return false;
        }
        // Se sei già lì, ti lascio stare così puoi cambiarla
        return true;
      }

      // 3. Se non devi cambiare password ma provi a entrare in /change-password,
      // forse vuoi solo cambiarla volontariamente, quindi ti lascio passare.
      
      return true;
    })
  );
};
