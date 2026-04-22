import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'app/common/services/auth.service';
import { I18nService } from 'app/common/services/i18n.service';
import { LayoutService } from 'app/common/services/layout.service';
import { WhiteLabelService } from 'app/common/services/white-label.service';
import { MenuService } from 'app/common/services/menu.service';
import { IconService } from 'app/common/services/icon.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  public authService = inject(AuthService);
  public i18nService = inject(I18nService);
  public layoutService = inject(LayoutService);
  public whiteLabelService = inject(WhiteLabelService);
  public menuService = inject(MenuService);
  public iconService = inject(IconService);

  public whiteLabelConfig$ = this.whiteLabelService.config$;
  public menuItems$ = this.menuService.menuItems$;
  public isAdmin$ = this.authService.systemRoles$.pipe(
    map(roles => roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))
  );

  logout(): void {
    this.authService.logout();
  }

  setLang(lang: string): void {
    this.i18nService.setLanguage(lang);
  }
}
