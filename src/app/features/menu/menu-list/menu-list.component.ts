
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { MenuItem } from '../../../core/models/menu-item.model';
import { MenuService } from '../../../core/services/menu.service';
import { ModalService } from '../../../core/services/modal.service';
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
  public menuItems$!: Observable<MenuItem[]>;

  ngOnInit(): void {
    this.menuItems$ = this.menuService.menuItems$;
    this.menuService.loadMenuItems().subscribe();
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
