import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './common/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-redirect',
  standalone: true,
  template: ''
})
export class HomeRedirectComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authService.systemRoles$.pipe(take(1)).subscribe(roles => {
      if (roles && (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))) {
        this.router.navigate(['/configurator/dashboard']);
      } else {
        this.router.navigate(['/configurator/dashboard']); // Redirect all authenticated users to configurator dashboard
      }
    });
  }
}
