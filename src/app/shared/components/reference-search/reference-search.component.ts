
import { Component, Input, forwardRef, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { RecordService } from '../../../core/services/record.service';
import { Record, PageResponse } from '../../../core/models/record.model';
import { Observable, of, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith } from 'rxjs/operators';
import { ModalService } from '../../../core/services/modal.service';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { EntityDefinition } from '../../../core/models/entity-definition.model';

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
  private entityDefService = inject(EntityDefinitionService);

  public selectedIds: string[] = [];
  public availableRecords$: Observable<Record[]> = of([]);
  public referencedEntityDef: EntityDefinition | null = null;

  private searchTerms = new Subject<string>();
  private searchField = new Subject<string>();
  public tempSelectedIds: string[] = [];

  private onChange = (value: string[]) => {};
  private onTouched = () => {};

  /**
   * Gets a suitable field name for previewing the record.
   * It looks for common names like 'name', 'title', 'label', or defaults to the first field.
   */
  get previewFieldName(): string {
    if (!this.referencedEntityDef || !this.referencedEntityDef.fields.length) {
      return '';
    }
    const commonNames = ['name', 'title', 'label', 'username', 'email'];
    const firstCommon = this.referencedEntityDef.fields.find(f => commonNames.includes(f.name));
    return firstCommon?.name || this.referencedEntityDef.fields[0].name;
  }

  ngOnInit(): void {
    this.availableRecords$ = combineLatest([
      this.searchTerms.pipe(startWith('')),
      this.searchField.pipe(startWith('id'))
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1]),
      switchMap(([term, field]) => {
        const filters = term ? [{ field, op: 'like', value: term }] : [];
        return this.recordService.loadRecords(this.entityKey, 0, 20, filters);
      }),
      map((response: PageResponse<Record>) => response.content)
    );
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  onSearchFieldChange(field: string): void {
    this.searchField.next(field);
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
    this.entityDefService.getEntityDefinition(this.entityKey).subscribe(def => {
      this.referencedEntityDef = def;
      this.tempSelectedIds = [...this.selectedIds];
      this.search(''); // Initial search
      this.modalService.openTemplate(this.selectionModalTemplate);
    });
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
