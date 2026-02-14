
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userState$.pipe(
    take(1),
    map(user => {
      const isAuthenticated = !!user?.token;
      const isFirstAccess = user?.firstAccess ?? false;
      const isChangePasswordRoute = state.url.includes('/change-password');

      if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
      }

      if (isFirstAccess && !isChangePasswordRoute) {
        // If it's the first access, force user to the change password page
        return router.createUrlTree(['/change-password']);
      }

      if (!isFirstAccess && isChangePasswordRoute) {
        // If not first access, prevent access to change password page (unless navigated to intentionally)
        // For simplicity, we redirect away. A better UX might show a message.
        return router.createUrlTree(['/']);
      }

      return true;
    })
  );
};
