
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
    // The service now manages filters, so we just need to trigger a load.
    this.recordService.loadRecords(this.entityKey, page).subscribe();
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
    this.modalService.openComponent(RecordHistoryComponent, {
      entityKey: this.entityKey,
      recordId: recordId
    });
  }

  openSearchModal(): void {
    this.modalService.openComponent(RecordSearchComponent, {
      definition: this.entityDefinition
    });
  }

  getJsonData(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}
