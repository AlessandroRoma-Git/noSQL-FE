import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'app/common/models/menu-item.model';
import { MenuService } from 'app/configurator/services/menu.service';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FilterCondition, FilterOperator } from 'app/consumer-app/services/filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './menu-list.component.html',
})
export class MenuListComponent implements OnInit, OnDestroy {
  private menuService = inject(MenuService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  public i18nService = inject(I18nService);
  private destroy$ = new Subject<void>();

  public allItems: MenuItem[] = [];
  public filteredItems: MenuItem[] = [];

  // --- QUERY BUILDER ---
  public showFilters = false;
  public filterRows: FilterCondition[] = [];
  public availableOperators: { label: string, value: FilterOperator }[] = [
    { label: 'Uguale', value: 'eq' },
    { label: 'Contiene', value: 'like' }
  ];
  public columns = [
    { name: 'label', label: 'Etichetta' },
    { name: 'entityKey', label: 'Entità' }
  ];

  ngOnInit(): void {
    this.menuService.menuItems$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(items => {
      this.allItems = items;
      this.applyLocalFilters();
    });

    this.menuService.loadMenuItems().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyLocalFilters(): void {
    if (this.filterRows.length === 0) {
      this.filteredItems = [...this.allItems];
    } else {
      this.filteredItems = this.allItems.filter(item => {
        return this.filterRows.every(row => {
          if (!row.field || row.value === '') return true;
          const val = String((item as any)[row.field] || '').toLowerCase();
          const filterVal = String(row.value).toLowerCase();
          if (row.op === 'eq') return val === filterVal;
          if (row.op === 'like') return val.includes(filterVal);
          return true;
        });
      });
    }
    this.cdr.detectChanges();
  }

  addFilterRow(): void {
    this.filterRows.push({ field: 'label', op: 'like', value: '' });
    this.showFilters = true;
  }

  removeFilterRow(index: number): void {
    this.filterRows.splice(index, 1);
    this.applyLocalFilters();
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.MENU_SETUP');
    this.modalService.openInfo('Guida Rapida: Menu', info);
  }

  onDelete(id: string, label: string): void {
    this.modalService.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare la voce <strong>${label}</strong> dal menu?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.menuService.deleteMenuItem(id).subscribe();
    });
  }
}
