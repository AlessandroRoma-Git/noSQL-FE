import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { RecordService } from 'app/consumer-app/services/record.service';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { ToastService } from 'app/common/services/toast.service';
import { I18nService } from 'app/common/services/i18n.service';
import { EntityDefinition } from 'app/configurator/models/entity-definition.model';
import { ReferenceSearchComponent } from 'app/common/components/reference-search/reference-search.component';

/**
 * @class ConsumerRecordEditorComponent
 * @description
 * Editor di record per Consumer.
 */
@Component({
  selector: 'app-consumer-record-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ReferenceSearchComponent],
  templateUrl: './consumer-record-editor.component.html',
})
export class ConsumerRecordEditorComponent implements OnInit {
  @Input() entityKey!: string;
  @Input() recordId: string | null = null;

  private recordService = inject(RecordService);
  private entityService = inject(EntityDefinitionService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  public i18nService = inject(I18nService);

  public editorForm: FormGroup = this.fb.group({});
  public definition?: EntityDefinition;
  public isEditMode = false;
  public isLoading = true;
  public isSchemaLess = false;

  ngOnInit(): void {
    this.isEditMode = !!this.recordId;
    this.loadDefinitionAndData();
  }

  loadDefinitionAndData(): void {
    this.isLoading = true;
    this.entityService.getPublicEntityDefinition(this.entityKey).subscribe({
      next: (def: EntityDefinition) => {
        this.definition = def;
        this.buildFormFromDefinition(def);
        this.loadRecordData();
      },
      error: () => {
        this.isSchemaLess = true;
        this.loadRecordData();
      }
    });
  }

  private buildFormFromDefinition(def: EntityDefinition): void {
    const controls: any = {};
    def.fields.forEach(field => {
      const validators: ValidatorFn[] = [];
      if (field.required) validators.push(Validators.required);
      if (field.type === 'EMAIL') validators.push(Validators.email);
      const initialValue = field.type === 'REFERENCE' ? [] : null;
      controls[field.name] = [initialValue, validators];
    });
    this.editorForm = this.fb.group(controls);
  }

  private loadRecordData(): void {
    if (this.isEditMode && this.recordId) {
      this.recordService.getRecord(this.entityKey, this.recordId).subscribe({
        next: (record) => {
          if (this.isSchemaLess) {
            this.buildFormFromData(record.data);
          } else {
            this.editorForm.patchValue(record.data);
          }
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Impossibile caricare il record.');
          this.router.navigate(['/records', this.entityKey]);
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  private buildFormFromData(data: any): void {
    const controls: any = {};
    Object.keys(data).forEach(key => {
      if (!['id', 'createdAt', 'updatedAt', 'deleted'].includes(key)) {
        controls[key] = [data[key]];
      }
    });
    this.editorForm = this.fb.group(controls);
  }

  public getKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  onSubmit(): void {
    if (this.editorForm.invalid) return;
    const payload = { data: this.editorForm.value };
    const operation = this.isEditMode && this.recordId
      ? this.recordService.updateRecord(this.entityKey, this.recordId, payload)
      : this.recordService.createRecord(this.entityKey, payload);
    operation.subscribe({
      next: () => {
        this.toastService.success('Operazione completata!');
        this.router.navigate(['/records', this.entityKey]);
      }
    });
  }
}
