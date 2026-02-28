import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject } from '@angular/core';
import { AuthService } from 'app/common/services/auth.service';
import { take } from 'rxjs/operators';

/**
 * @directive HasRoleDirective
 * @description
 * Mostra o nasconde un elemento HTML in base ai permessi dell'utente.
 * Funziona per:
 * - Ruoli di sistema: SUPER_ADMIN, ADMIN
 * - Gruppi custom: es. 'editors', 'viewers'
 * 
 * Uso: <button *appHasRole="'ADMIN'">Gestisci Entità</button>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  @Input('appHasRole') role!: string;

  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit() {
    this.authService.userState$.pipe(take(1)).subscribe(state => {
      const roles = state?.systemRoles || [];
      const groups = state?.groups || [];

      const hasRequiredRole = 
        roles.includes('SUPER_ADMIN') || 
        roles.includes('ADMIN') || 
        roles.includes(this.role) ||
        groups.includes(this.role);

      if (hasRequiredRole) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
