
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { RecordService } from '../../core/services/record.service';
import { Record } from '../../core/models/record.model';
import { ModalService } from '../../core/services/modal.service';
import { filter } from 'rxjs/operators';
import { EntityDefinitionService } from '../../core/services/entity-definition.service';
import { EntityDefinition } from '../../core/models/entity-definition.model';
import { RecordHistoryComponent } from './record-history/record-history.component';
import { RecordSearchComponent } from './record-search/record-search.component';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './record-list.component.html',
})
export class RecordListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recordService = inject(RecordService);
  private entityDefinitionService = inject(EntityDefinitionService);
  private modalService = inject(ModalService);

  public records$!: Observable<Record[]>;
  public pageInfo$!: Observable<any>;
  public entityDefinition!: EntityDefinition;
  public entityKey!: string;

  private currentFilters: any[] = [];
  private currentSorts: any[] = [];

  ngOnInit(): void {
    this.entityKey = this.route.snapshot.paramMap.get('entityKey')!;
    this.records$ = this.recordService.records$;
    this.pageInfo$ = this.recordService.pageInfo$;

    this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe(def => {
      this.entityDefinition = def;
    });

    this.loadRecords();
  }

  loadRecords(page = 0): void {
    this.recordService.loadRecords(this.entityKey, page, 20, this.currentFilters, this.currentSorts).subscribe();
  }

  onDelete(id: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete this record?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.recordService.deleteRecord(this.entityKey, id).subscribe();
    });
  }

  onShowHistory(recordId: string): void {
    // ... (implementation remains the same)
  }

  openSearchModal(): void {
    const componentRef = this.modalService.open(RecordSearchComponent);
    // This is a hacky way to pass data.
    setTimeout(() => {
      const instance = (document.querySelector('app-record-search') as any);
      if (instance) {
        instance.definition = this.entityDefinition;
        instance.search.subscribe((event: { filters: any[], sorts: any[] }) => {
          this.currentFilters = event.filters;
          this.currentSorts = event.sorts;
          this.loadRecords();
        });
      }
    }, 0);
  }

  getJsonData(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}
