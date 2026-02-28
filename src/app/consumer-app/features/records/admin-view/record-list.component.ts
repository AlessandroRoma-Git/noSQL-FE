import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { RecordService } from 'app/consumer-app/services/record.service';
import { Record } from 'app/consumer-app/models/record.model';
import { ModalService } from 'app/common/services/modal.service';
import { ToastService } from 'app/common/services/toast.service';
import { filter, map, take } from 'rxjs/operators';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { EntityDefinition, Field } from 'app/configurator/models/entity-definition.model';
import { I18nService } from 'app/common/services/i18n.service';
import { AuthService } from 'app/common/services/auth.service';
import { ConsumerRecordListComponent } from '../consumer-view/consumer-record-list.component';

/**
 * @class RecordListComponent
 * @description
 * Punto di ingresso per la lista record. Decide se mostrare la vista Admin o Consumer.
 */
@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConsumerRecordListComponent],
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
  public hasError = false;

  public currentFilters: any[] = []; 
  public currentSorts: any[] = [{ field: 'createdAt', direction: 'desc' }]; 
  public currentPage = 0;
  public pageSize = 10;
  
  private routeSub!: Subscription;

  ngOnInit(): void {
    // Definiamo il ruolo una volta sola
    this.isAdmin$ = this.authService.systemRoles$.pipe(
      map(roles => roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))
    );

    // Ascoltiamo i cambi di URL
    this.routeSub = this.route.paramMap.subscribe(params => {
      const newKey = params.get('entityKey');
      if (newKey) {
        this.entityKey = newKey;
        this.resetAndReload();
      }
    });

    this.records$ = this.recordService.records$;
    this.pageInfo$ = this.recordService.pageInfo$;
  }

  private resetAndReload(): void {
    this.currentPage = 0;
    this.hasError = false;
    this.entityDefinition = null; 
    this.cdr.detectChanges(); // Forziamo reset visivo

    this.isAdmin$.pipe(take(1)).subscribe(isAdmin => {
      if (isAdmin) {
        this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe({
          next: (def) => {
            console.log('Schema caricato con successo per:', this.entityKey);
            this.entityDefinition = def;
            this.loadRecords(); 
            this.cdr.detectChanges(); // Forziamo il passaggio da loading a tabella
          },
          error: (err) => {
            console.error('Errore nel caricamento definizione:', err);
            this.hasError = true;
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

  loadRecords(page = this.currentPage): void {
    this.currentPage = page;
    this.recordService.loadRecords(
      this.entityKey, 
      this.currentPage, 
      this.pageSize, 
      this.currentFilters, 
      this.currentSorts
    ).subscribe({
      next: () => {
        this.cdr.detectChanges();
      },
      error: () => { 
        this.hasError = true; 
        this.cdr.detectChanges();
      }
    });
  }

  toggleSort(fieldName: string): void {
    const current = this.currentSorts.find(s => s.field === fieldName);
    if (current) {
      current.direction = current.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSorts = [{ field: fieldName, direction: 'asc' }];
    }
    this.loadRecords(0);
  }

  onSearch(event: any): void {
    const term = event.target.value;
    if (!term) {
      this.currentFilters = [];
    } else {
      const fields = this.entityDefinition?.fields.filter(f => f.type === 'STRING' || f.type === 'EMAIL') || [];
      if (fields.length > 0) {
        this.currentFilters = [{ field: fields[0].name, op: 'like', value: term }];
      }
    }
    this.loadRecords(0);
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
        },
        error: () => this.toastService.error('Impossibile eliminare il record')
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
