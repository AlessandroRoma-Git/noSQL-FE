
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RecordHistoryService } from '../../../core/services/record-history.service';

@Component({
  selector: 'app-record-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-history.component.html',
})
export class RecordHistoryComponent implements OnInit {
  @Input() entityKey!: string;
  @Input() recordId!: string;

  private historyService = inject(RecordHistoryService);
  public history$!: Observable<any[]>;

  ngOnInit(): void {
    if (this.entityKey && this.recordId) {
      this.history$ = this.historyService.getRecordHistory(this.entityKey, this.recordId);
    }
  }

  getJsonData(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}
