import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { RecordService } from 'app/consumer-app/services/record.service';
import { Record } from 'app/consumer-app/models/record.model';
import { ModalService } from 'app/common/services/modal.service';
import { ToastService } from 'app/common/services/toast.service';
import { filter, map, take, finalize } from 'rxjs/operators';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { EntityDefinition, Field } from 'app/configurator/models/entity-definition.model';
import { I18nService } from 'app/common/services/i18n.service';
import { AuthService } from 'app/common/services/auth.service';
import { ConsumerRecordListComponent } from '../consumer-view/consumer-record-list.component';
import { FilterCondition, FilterOperator } from 'app/consumer-app/services/filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConsumerRecordListComponent, FormsModule],
  templateUrl: './record-list.component.html',
})
export class RecordListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recordService = inject(RecordService);
  private entityDefinitionService = inject(EntityDefinitionService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  public i18nService = inject(I18nService);

  public records$!: Observable<Record[]>; 
  public pageInfo$!: Observable<any>; 
  public entityDefinition: EntityDefinition | null = null; 
  public entityKey!: string; 
  public isAdmin$!: Observable<boolean>;
  public isLoading = false;

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
  public currentPage = 0;
  public pageSize = 10;
  
  private routeSub!: Subscription;

  ngOnInit(): void {
    this.isAdmin$ = this.authService.systemRoles$.pipe(
      map(roles => roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))
    );

    this.routeSub = this.route.paramMap.subscribe(params => {
      const newKey = params.get('entityKey');
      if (newKey) {
        this.entityKey = newKey;
        this.activeFilters = [];
        this.resetAndReload();
      }
    });

    this.records$ = this.recordService.records$;
    this.pageInfo$ = this.recordService.pageInfo$;
  }

  private resetAndReload(): void {
    this.currentPage = 0;
    this.entityDefinition = null; 
    this.cdr.detectChanges();

    this.isAdmin$.pipe(take(1)).subscribe(isAdmin => {
      if (isAdmin) {
        this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe({
          next: (def) => {
            this.entityDefinition = def;
            if (def.fields.length > 0) this.nextFilter.field = def.fields[0].name;
            this.applySearch(0);
            this.cdr.detectChanges();
          },
          error: () => {
            this.toastService.error('Impossibile caricare lo schema.');
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.RECORDS');
    this.modalService.openInfo('Guida Rapida: Tabella Dati', info);
  }

  applySearch(page = this.currentPage): void {
    this.currentPage = page;
    this.isLoading = true;
    this.recordService.loadRecords(
      this.entityKey, 
      this.currentPage, 
      this.pageSize, 
      this.activeFilters, 
      this.currentSorts
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe();
  }

  addOrUpdateFilter(): void {
    if (!this.nextFilter.field || this.nextFilter.value === '') return;
    let val = this.nextFilter.value;
    if (this.nextFilter.op === 'in' && typeof val === 'string') val = val.split(',').map(s => s.trim());
    
    if (this.editingFilterIndex !== null) {
      this.activeFilters[this.editingFilterIndex] = { ...this.nextFilter, value: val };
      this.editingFilterIndex = null;
    } else {
      this.activeFilters.push({ ...this.nextFilter, value: val });
    }
    this.nextFilter.value = '';
  }

  editFilter(index: number): void {
    this.editingFilterIndex = index;
    const f = this.activeFilters[index];
    this.nextFilter = { ...f, value: Array.isArray(f.value) ? f.value.join(', ') : f.value };
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

  onSearch(event: any): void {
    const term = event.target.value;
    // La ricerca veloce ora agisce solo sulla lista filtri locale, ma serve il tasto CERCA per confermare
    this.activeFilters = this.activeFilters.filter(f => f.op !== 'like');
    if (term) {
      const fields = this.entityDefinition?.fields.filter(f => f.type === 'STRING' || f.type === 'EMAIL') || [];
      if (fields.length > 0) {
        this.activeFilters.push({ field: fields[0].name, op: 'like', value: term });
      }
    }
  }

  onDelete(id: string): void {
    this.modalService.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare questo record? L'azione è reversibile solo da database.`
    ).pipe(
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.recordService.deleteRecord(this.entityKey, id).subscribe({
        next: () => {
          this.toastService.success('Record eliminato con successo');
          this.cdr.detectChanges();
        }
      });
    });
  }

  formatCellData(data: any, field: Field): string {
    if (data === null || data === undefined) return '–';
    switch (field.type) {
      case 'BOOLEAN': return data ? 'Sì' : 'No';
      case 'DATE': return new Date(data).toLocaleString('it-IT');
      case 'REFERENCE': return Array.isArray(data) ? `[${data.length} rif.]` : '1 rif.';
      default: return String(data);
    }
  }
}
