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
import { take, finalize } from 'rxjs/operators';

/**
 * @class ConsumerRecordListComponent
 * @description
 * Visualizzazione record per utenti non-admin.
 * Gestisce il caricamento dati e la reattività ai cambi di rotta.
 */
@Component({
  selector: 'app-consumer-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink, KeyValuePipe],
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
      this.loadAll();
    }
  }

  ngOnDestroy(): void {
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  /**
   * Avvia il caricamento completo (Definizione + Dati).
   */
  loadAll(): void {
    this.isLoading = true;
    this.records = [];
    this.definition = undefined;
    this.cdr.detectChanges(); // Mostriamo subito il caricamento

    this.entityService.getPublicEntityDefinition(this.entityKey).pipe(
      finalize(() => {
        // Se la definizione fallisce, proviamo comunque a caricare i dati (schema-less)
        if (!this.definition) {
          this.loadData(0);
        }
      })
    ).subscribe({
      next: (def: EntityDefinition) => {
        this.definition = def;
        this.calculatePermissions(def);
        this.loadData(0);
      },
      error: () => {
        console.warn('Impossibile caricare lo schema per', this.entityKey, '- Procedo in modalità schema-less');
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
   * Carica i record dall'API search.
   */
  loadData(page: number): void {
    this.currentPage = page;
    this.isLoading = true;
    if (this.dataSub) this.dataSub.unsubscribe();
    
    this.dataSub = this.recordService.searchRecords(this.entityKey, page, 10).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Fondamentale per sbloccare la UI
      })
    ).subscribe({
      next: (response: PageResponse<Record>) => {
        this.records = response.content;
        this.pageInfo = response;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei dati:', err);
        this.toastService.error('Tabella non trovata o permessi insufficienti.');
        this.router.navigate(['/dashboard']);
      }
    });
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
