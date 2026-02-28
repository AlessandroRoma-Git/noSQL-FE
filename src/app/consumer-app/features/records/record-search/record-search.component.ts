import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntityDefinition } from 'app/configurator/models/entity-definition.model';
import { ModalService } from 'app/common/services/modal.service';
import { RecordService } from 'app/consumer-app/services/record.service';

@Component({
  selector: 'app-record-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './record-search.component.html',
})
export class RecordSearchComponent implements OnInit {
  @Input() definition!: EntityDefinition;

  searchForm!: FormGroup;
  filterOperators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'like'];
  sortDirections = ['asc', 'desc'];

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService, // Made public
    private recordService: RecordService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      filters: this.fb.array([]),
      sorts: this.fb.array([])
    });
  }

  get filters(): FormArray {
    return this.searchForm.get('filters') as FormArray;
  }

  get sorts(): FormArray {
    return this.searchForm.get('sorts') as FormArray;
  }

  addFilter(): void {
    const filterGroup = this.fb.group({
      field: [this.definition.fields[0]?.name || '', Validators.required],
      op: ['eq', Validators.required],
      value: ['', Validators.required]
    });
    this.filters.push(filterGroup);
  }

  removeFilter(index: number): void {
    this.filters.removeAt(index);
  }

  addSort(): void {
    const sortGroup = this.fb.group({
      field: [this.definition.fields[0]?.name || '', Validators.required],
      direction: ['asc', Validators.required]
    });
    this.sorts.push(sortGroup);
  }

  removeSort(index: number): void {
    this.sorts.removeAt(index);
  }

  onSearch(): void {
    if (this.searchForm.invalid) return;
    const { filters, sorts } = this.searchForm.value;
    this.recordService.loadRecords(this.definition.entityKey, 0, 20, filters, sorts).subscribe();
    this.modalService.close();
  }
}
