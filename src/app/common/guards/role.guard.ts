import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isConfigRoute = _state.url.includes('/dashboard') ||
                       _state.url.includes('/settings') || 
                       _state.url.includes('/entity-definitions') || 
                       _state.url.includes('/email-templates') || 
                       _state.url.includes('/groups') || 
                       _state.url.includes('/users') || 
                       _state.url.includes('/menu');

  return authService.systemRoles$.pipe(
    take(1),
    map(roles => {
      const isSuperAdmin = roles.includes('SUPER_ADMIN');
      const isAdmin = roles.includes('ADMIN');

      if (isConfigRoute) {
        if (isSuperAdmin) return true;
      } else {
        // Rotte generiche admin (come la dashboard CMS)
        if (isAdmin || isSuperAdmin) return true;
      }

      router.navigate(['/app']); 
      return false;
    })
  );
};
