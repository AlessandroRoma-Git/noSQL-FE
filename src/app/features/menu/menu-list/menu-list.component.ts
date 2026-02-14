
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { MenuItem } from '../../../core/models/menu-item.model';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  private menuService = inject(MenuService);
  public menuItems$!: Observable<MenuItem[]>;

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.menuItems$ = this.menuService.getMenuItems();
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.menuService.deleteMenuItem(id).subscribe(() => {
        this.loadMenuItems();
      });
    }
  }
}
