
import { Component, Input, forwardRef, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { RecordService } from '../../../core/services/record.service';
import { Record, PageResponse } from '../../../core/models/record.model';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-reference-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reference-search.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReferenceSearchComponent),
      multi: true
    }
  ]
})
export class ReferenceSearchComponent implements ControlValueAccessor, OnInit {
  @Input() entityKey!: string;
  @ViewChild('selectionModal') selectionModalTemplate!: TemplateRef<any>;

  private recordService = inject(RecordService);
  public modalService = inject(ModalService);

  public selectedIds: string[] = [];
  public availableRecords$: Observable<Record[]> = of([]);

  private searchTerms = new Subject<string>();
  public tempSelectedIds: string[] = [];

  private onChange = (value: string[]) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.availableRecords$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.recordService.loadRecords(this.entityKey, 0, 20, term ? [{ field: 'id', op: 'like', value: term }] : [])),
      map((response: PageResponse<Record>) => response.content)
    );
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  writeValue(value: any): void {
    this.selectedIds = Array.isArray(value) ? [...value] : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  openSelectionModal(): void {
    this.tempSelectedIds = [...this.selectedIds];
    this.search('');
    this.modalService.openTemplate(this.selectionModalTemplate);
  }

  toggleSelection(recordId: string): void {
    const index = this.tempSelectedIds.indexOf(recordId);
    if (index > -1) {
      this.tempSelectedIds.splice(index, 1);
    } else {
      this.tempSelectedIds.push(recordId);
    }
  }

  confirmSelection(): void {
    this.selectedIds = [...this.tempSelectedIds];
    this.onChange(this.selectedIds);
    this.onTouched();
    this.modalService.close();
  }

  removeId(idToRemove: string): void {
    this.selectedIds = this.selectedIds.filter(id => id !== idToRemove);
    this.onChange(this.selectedIds);
    this.onTouched();
  }
}
