
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { MenuItem } from 'app/common/models/menu-item.model';
import { MenuService } from 'app/configurator/services/menu.service';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  private menuService = inject(MenuService);
  private modalService = inject(ModalService);
  public i18nService = inject(I18nService);
  public menuItems$!: Observable<MenuItem[]>;

  ngOnInit(): void {
    this.menuItems$ = this.menuService.menuItems$;
    this.menuService.loadMenuItems().subscribe();
  }

  /**
   * Questo metodo apre una finestrella (Modal) che spiega all'utente
   * cosa deve fare in questa pagina.
   */
  showHelp(): void {
    const info = this.i18nService.translate('HELP.MENU_SETUP');
    this.modalService.openInfo('Guida Rapida: Menu', info);
  }

  onDelete(id: string, label: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete the menu item <strong>${label}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.menuService.deleteMenuItem(id).subscribe();
    });
  }
}
