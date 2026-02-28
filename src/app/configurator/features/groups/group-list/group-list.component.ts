import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Group } from 'app/configurator/models/group.model';
import { GroupService } from 'app/configurator/services/group.service';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';
import { filter } from 'rxjs/operators';
import { FilterCondition, FilterOperator } from 'app/consumer-app/services/filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './group-list.component.html',
})
export class GroupListComponent implements OnInit, OnDestroy {
  private groupService = inject(GroupService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  public i18nService = inject(I18nService);
  private destroy$ = new Subject<void>();

  public allGroups: Group[] = [];
  public filteredGroups: Group[] = [];

  // --- QUERY BUILDER ---
  public showFilters = false;
  public filterRows: FilterCondition[] = [];
  public availableOperators: { label: string, value: FilterOperator }[] = [
    { label: 'Uguale', value: 'eq' },
    { label: 'Contiene', value: 'like' }
  ];
  public columns = [
    { name: 'name', label: 'Nome Gruppo' },
    { name: 'systemRole', label: 'Ruolo Sistema' }
  ];

  ngOnInit(): void {
    this.groupService.groups$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(groups => {
      this.allGroups = groups;
      this.applyLocalFilters();
    });

    this.groupService.loadGroups().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyLocalFilters(): void {
    if (this.filterRows.length === 0) {
      this.filteredGroups = [...this.allGroups];
    } else {
      this.filteredGroups = this.allGroups.filter(group => {
        return this.filterRows.every(row => {
          if (!row.field || row.value === '') return true;
          const val = String((group as any)[row.field] || '').toLowerCase();
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
    this.filterRows.push({ field: 'name', op: 'like', value: '' });
    this.showFilters = true;
  }

  removeFilterRow(index: number): void {
    this.filterRows.splice(index, 1);
    this.applyLocalFilters();
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.GROUPS');
    this.modalService.openInfo('Guida Rapida: Gruppi', info);
  }

  onDelete(id: string, name: string): void {
    this.modalService.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare il gruppo <strong>${name}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.groupService.deleteGroup(id).subscribe();
    });
  }
}
