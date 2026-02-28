
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { RecordService } from '../../core/services/record.service';
import { Record } from '../../core/models/record.model';
import { ModalService } from '../../core/services/modal.service';
import { ToastService } from '../../core/services/toast.service';
import { filter } from 'rxjs/operators';
import { EntityDefinitionService } from '../../core/services/entity-definition.service';
import { EntityDefinition, Field } from '../../core/models/entity-definition.model';

/**
 * @class RecordListComponent
 * @description
 * Questa è la "Tabella Intelligente" del nostro CMS.
 * Mostra la lista di tutti i dati (record) di una specifica entità.
 * Include la ricerca, l'ordinamento e la paginazione (per non caricare tutto insieme).
 * È totalmente responsive: su cellulare i dati diventano delle comode "schede".
 */
@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './record-list.component.html',
})
export class RecordListComponent implements OnInit, OnDestroy {
  // --- STRUMENTI ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recordService = inject(RecordService);
  private entityDefinitionService = inject(EntityDefinitionService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);

  // --- DATI ---
  public records$!: Observable<Record[]>; // Il "canale" che ci invia i dati da mostrare
  public pageInfo$!: Observable<any>; // Info su che pagina siamo e quanti dati ci sono in totale
  public entityDefinition!: EntityDefinition; // Lo schema della tabella
  public entityKey!: string; // Il nome tecnico della tabella (es: 'customers')

  // --- STATO DELLA RICERCA ---
  public currentFilters: any[] = []; // Filtri attivi (es: "nome contiene Rossi")
  public currentSorts: any[] = [{ field: 'createdAt', direction: 'desc' }]; // Ordinamento (default: più recenti prima)
  public currentPage = 0;
  public pageSize = 10;
  
  private routeSub!: Subscription;

  /**
   * Appena entriamo nella pagina...
   */
  ngOnInit(): void {
    // Restiamo in ascolto dei cambiamenti nell'indirizzo (URL)
    // Se passiamo da /records/customers a /records/products, la pagina si aggiorna!
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.entityKey = params.get('entityKey')!;
      this.currentPage = 0; // Quando cambiamo tabella, ricominciamo dalla pagina 1
      
      // Scarichiamo lo schema della nuova tabella
      this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe(def => {
        this.entityDefinition = def;
        this.loadRecords(); // E poi carichiamo i dati
      });
    });

    this.records$ = this.recordService.records$;
    this.pageInfo$ = this.recordService.pageInfo$;
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  /**
   * Chiede al server i dati corretti in base a pagina, filtri e ordinamento.
   */
  loadRecords(page = this.currentPage): void {
    this.currentPage = page;
    this.recordService.loadRecords(
      this.entityKey, 
      this.currentPage, 
      this.pageSize, 
      this.currentFilters, 
      this.currentSorts
    ).subscribe();
  }

  /**
   * Cambia l'ordinamento di una colonna quando ci clicchi sopra.
   */
  toggleSort(fieldName: string): void {
    const current = this.currentSorts.find(s => s.field === fieldName);
    if (current) {
      // Se era crescente, diventa decrescente. Se era decrescente, togliamo l'ordinamento.
      current.direction = current.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Se non c'era ordinamento, mettiamolo crescente
      this.currentSorts = [{ field: fieldName, direction: 'asc' }];
    }
    this.loadRecords(0); // Ricominciamo dalla prima pagina
  }

  /**
   * Ricerca testuale veloce (Filtro 'like').
   */
  onSearch(event: any): void {
    const term = event.target.value;
    if (!term) {
      this.currentFilters = [];
    } else {
      // Cerchiamo il termine in tutti i campi di tipo STRING dell'entità
      const stringFields = this.entityDefinition.fields.filter(f => f.type === 'STRING' || f.type === 'EMAIL');
      if (stringFields.length > 0) {
        // Per semplicità qui filtriamo sul primo campo stringa trovato
        this.currentFilters = [{ field: stringFields[0].name, op: 'like', value: term }];
      }
    }
    this.loadRecords(0);
  }

  /**
   * Chiede conferma prima di eliminare un dato.
   */
  onDelete(id: string): void {
    this.modalService.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare questo record? L'azione è reversibile solo da database.`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.recordService.deleteRecord(this.entityKey, id).subscribe({
        next: () => this.toastService.success('Record eliminato con successo'),
        error: () => this.toastService.error('Impossibile eliminare il record')
      });
    });
  }

  /**
   * Trasforma i dati "grezzi" del database in testi leggibili per l'utente.
   * Es: 'true' diventa '✓', una data ISO diventa '15/01/2025'.
   */
  formatCellData(data: any, field: Field): string {
    if (data === null || data === undefined) return '–';
    
    switch (field.type) {
      case 'BOOLEAN':
        return data ? 'Sì' : 'No';
      case 'DATE':
        return new Date(data).toLocaleString('it-IT');
      case 'REFERENCE':
        return Array.isArray(data) ? `[${data.length} rif.]` : '1 rif.';
      default:
        return String(data);
    }
  }
}
