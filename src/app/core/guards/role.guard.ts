import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.systemRoles$.pipe(
    take(1),
    map(roles => {
      if (roles && (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))) {
        return true; // User has required role
      } else {
        router.navigate(['/dashboard']); // Redirect to a safe page
        return false;
      }
    })
  );
};