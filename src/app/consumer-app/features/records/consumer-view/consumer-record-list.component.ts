import { Component, OnInit, inject, OnDestroy, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { RecordService } from 'app/consumer-app/services/record.service';
import { Record, PageResponse } from 'app/consumer-app/models/record.model';
import { I18nService } from 'app/common/services/i18n.service';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { EntityDefinition } from 'app/configurator/models/entity-definition.model';
import { AuthService } from 'app/common/services/auth.service';
import { ToastService } from 'app/common/services/toast.service';
import { FilterCondition, FilterOperator } from 'app/consumer-app/services/filter.service';
import { take, finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

/**
 * @class ConsumerRecordListComponent
 * @description
 * Visualizzazione record per utenti non-admin.
 * Implementa un Query Builder con righe di filtri editabili.
 */
@Component({
  selector: 'app-consumer-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './consumer-record-list.component.html',
})
export class ConsumerRecordListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() entityKey!: string;

  private recordService = inject(RecordService);
  private entityService = inject(EntityDefinitionService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public i18nService = inject(I18nService);

  public records: Record[] = [];
  public definition?: EntityDefinition;
  public pageInfo: any = {};
  public currentPage = 0;
  public isLoading = true;

  // --- QUERY BUILDER STATE ---
  public showFilters = false;
  public filterRows: FilterCondition[] = [];
  
  public availableOperators: { label: string, value: FilterOperator }[] = [
    { label: 'Uguale', value: 'eq' },
    { label: 'Diverso', value: 'ne' },
    { label: 'Contiene', value: 'like' },
    { label: 'Maggiore di', value: 'gt' },
    { label: 'Minore di', value: 'lt' },
    { label: 'In lista', value: 'in' }
  ];

  public currentSorts: any[] = [{ field: 'createdAt', direction: 'desc' }];
  public canWrite = false;
  public canDelete = false;

  private dataSub!: Subscription;

  ngOnInit(): void {
    if (this.entityKey) {
      this.loadAll();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entityKey'] && !changes['entityKey'].firstChange) {
      this.filterRows = []; 
      this.loadAll();
    }
  }

  ngOnDestroy(): void {
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  loadAll(): void {
    this.isLoading = true;
    this.entityService.getPublicEntityDefinition(this.entityKey).pipe(
      finalize(() => {
        if (!this.definition) this.applySearch();
      })
    ).subscribe({
      next: (def: EntityDefinition) => {
        this.definition = def;
        this.calculatePermissions(def);
        this.applySearch();
      }
    });
  }

  private calculatePermissions(def: EntityDefinition): void {
    this.authService.userState$.pipe(take(1)).subscribe(state => {
      const userGroups = state?.groups || [];
      const roles = state?.systemRoles || [];
      const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
      if (isAdmin) {
        this.canWrite = true;
        this.canDelete = true;
      } else {
        const acl = def.acl;
        this.canWrite = acl?.write ? acl.write.some(g => userGroups.includes(g)) : true;
        this.canDelete = acl?.delete ? acl.delete.some(g => userGroups.includes(g)) : true;
      }
      this.cdr.detectChanges();
    });
  }

  /**
   * Applica i filtri ed esegue la ricerca
   */
  applySearch(page = 0): void {
    this.currentPage = page;
    this.isLoading = true;
    if (this.dataSub) this.dataSub.unsubscribe();
    
    // Pulizia valori per operatore 'in' prima dell'invio
    const processedFilters = this.filterRows
      .filter(f => f.field && f.value !== '')
      .map(f => {
        if (f.op === 'in' && typeof f.value === 'string') {
          return { ...f, value: f.value.split(',').map(s => s.trim()).filter(s => s) };
        }
        return f;
      });

    this.dataSub = this.recordService.loadRecords(
      this.entityKey, 
      page, 
      10, 
      processedFilters, 
      this.currentSorts
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: PageResponse<Record>) => {
        this.records = response.content;
        this.pageInfo = response;
      }
    });
  }

  // --- QUERY BUILDER ACTIONS ---

  addFilterRow(): void {
    const defaultField = this.definition?.fields[0]?.name || '';
    this.filterRows.push({ field: defaultField, op: 'eq', value: '' });
    this.showFilters = true;
  }

  removeFilterRow(index: number): void {
    this.filterRows.splice(index, 1);
  }

  resetFilters(): void {
    this.filterRows = [];
    this.applySearch(0);
  }

  toggleSort(fieldName: string): void {
    const current = this.currentSorts.find(s => s.field === fieldName);
    if (current) {
      current.direction = current.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSorts = [{ field: fieldName, direction: 'asc' }];
    }
    this.applySearch(0);
  }

  formatCellData(data: any, fieldName: string): string {
    if (data === null || data === undefined) return '–';
    const field = this.definition?.fields.find(f => f.name === fieldName);
    if (field) {
      switch (field.type) {
        case 'BOOLEAN': return data ? 'Sì' : 'No';
        case 'DATE': return new Date(data).toLocaleString('it-IT');
        case 'REFERENCE': return Array.isArray(data) ? `[${data.length} rif.]` : '1 rif.';
      }
    }
    return String(data);
  }
}
