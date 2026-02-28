import { Component, OnInit, inject, OnDestroy, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // --- FILTRI AVANZATI ---
  public showAdvancedFilters = false;
  public activeFilters: FilterCondition[] = [];
  public editingFilterIndex: number | null = null;
  public nextFilter: FilterCondition = { field: '', op: 'eq', value: '' };
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
      this.activeFilters = [];
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
        if (def.fields.length > 0) this.nextFilter.field = def.fields[0].name;
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
   * Applica la ricerca effettiva (Tasto CERCA)
   */
  applySearch(page = 0): void {
    this.currentPage = page;
    this.isLoading = true;
    if (this.dataSub) this.dataSub.unsubscribe();
    
    this.dataSub = this.recordService.loadRecords(
      this.entityKey, 
      page, 
      10, 
      this.activeFilters, 
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

  // --- LOGICA FILTRI ---

  addOrUpdateFilter(): void {
    if (!this.nextFilter.field || this.nextFilter.value === '') return;
    
    let finalValue = this.nextFilter.value;
    if (this.nextFilter.op === 'in' && typeof finalValue === 'string') {
      finalValue = finalValue.split(',').map(s => s.trim());
    }

    if (this.editingFilterIndex !== null) {
      this.activeFilters[this.editingFilterIndex] = { ...this.nextFilter, value: finalValue };
      this.editingFilterIndex = null;
    } else {
      this.activeFilters.push({ ...this.nextFilter, value: finalValue });
    }

    this.nextFilter.value = '';
    // NOTA: Non chiamiamo applySearch() qui, aspettiamo il tasto Cerca
  }

  editFilter(index: number): void {
    this.editingFilterIndex = index;
    const filter = this.activeFilters[index];
    this.nextFilter = { ...filter, value: Array.isArray(filter.value) ? filter.value.join(', ') : filter.value };
    this.showAdvancedFilters = true;
  }

  removeFilter(index: number): void {
    this.activeFilters.splice(index, 1);
    if (this.editingFilterIndex === index) this.editingFilterIndex = null;
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
