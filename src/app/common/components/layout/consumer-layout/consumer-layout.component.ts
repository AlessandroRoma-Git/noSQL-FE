import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'app/common/services/auth.service';
import { I18nService } from 'app/common/services/i18n.service';
import { WhiteLabelService } from 'app/common/services/white-label.service';
import { MenuService } from 'app/common/services/menu.service';

@Component({
  selector: 'app-consumer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './consumer-layout.component.html',
  styleUrls: ['./consumer-layout.component.css']
})
export class ConsumerLayoutComponent {
  public authService = inject(AuthService);
  public i18nService = inject(I18nService);
  public whiteLabelService = inject(WhiteLabelService);
  private menuService = inject(MenuService);

  public whiteLabelConfig$ = this.whiteLabelService.config$;
  public userMenuItems$ = this.menuService.userMenuItems$;

  logout(): void {
    this.authService.logout();
  }

  setLang(lang: string): void {
    this.i18nService.setLanguage(lang);
  }
}
