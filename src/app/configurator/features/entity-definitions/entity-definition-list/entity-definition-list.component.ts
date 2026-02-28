import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EntityDefinition } from 'app/configurator/models/entity-definition.model';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FilterCondition, FilterOperator } from 'app/consumer-app/services/filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entity-definition-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './entity-definition-list.component.html',
})
export class EntityDefinitionListComponent implements OnInit, OnDestroy {
  private entityDefinitionService = inject(EntityDefinitionService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  public i18nService = inject(I18nService);
  private destroy$ = new Subject<void>();

  public allDefs: EntityDefinition[] = [];
  public filteredDefs: EntityDefinition[] = [];

  // --- QUERY BUILDER ---
  public showFilters = false;
  public filterRows: FilterCondition[] = [];
  public availableOperators: { label: string, value: FilterOperator }[] = [
    { label: 'Uguale', value: 'eq' },
    { label: 'Contiene', value: 'like' }
  ];
  public columns = [
    { name: 'entityKey', label: 'Tech Name' },
    { name: 'label', label: 'Display Label' }
  ];

  ngOnInit(): void {
    this.entityDefinitionService.definitions$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(definitions => {
      this.allDefs = definitions;
      this.applyLocalFilters();
    });

    this.entityDefinitionService.loadEntityDefinitions().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyLocalFilters(): void {
    if (this.filterRows.length === 0) {
      this.filteredDefs = [...this.allDefs];
    } else {
      this.filteredDefs = this.allDefs.filter(def => {
        return this.filterRows.every(row => {
          if (!row.field || row.value === '') return true;
          const val = String((def as any)[row.field] || '').toLowerCase();
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
    const info = this.i18nService.translate('HELP.ENTITIES');
    this.modalService.openInfo('Guida Rapida: Entità', info);
  }

  onDelete(key: string): void {
    this.modalService.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare l'entità <strong>${key}</strong>? I dati non verranno rimossi, ma non sarà più possibile gestirli.`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.entityDefinitionService.deleteEntityDefinition(key).subscribe();
    });
  }
}
