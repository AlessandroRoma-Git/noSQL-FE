
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EntityDefinitionService } from '../../core/services/entity-definition.service';
import { RecordService } from '../../core/services/record.service';
import { EntityDefinition } from '../../core/models/entity-definition.model';
import { ReferenceSearchComponent } from '../../shared/components/reference-search/reference-search.component';

@Component({
  selector: 'app-record-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ReferenceSearchComponent],
  templateUrl: './record-editor.component.html',
})
export class RecordEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private entityDefinitionService = inject(EntityDefinitionService);
  private recordService = inject(RecordService);

  public editorForm!: FormGroup;
  public entityDefinition!: EntityDefinition;
  public isEditMode = false;
  public entityKey!: string; // Made public
  private recordId: string | null = null;

  ngOnInit(): void {
    this.entityKey = this.route.snapshot.paramMap.get('entityKey')!;
    this.recordId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recordId;

    this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe(def => {
      this.entityDefinition = def;
      this.buildForm();
    });
  }

  private buildForm(): void {
    const formControls: { [key: string]: any } = {};
    this.entityDefinition.fields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'EMAIL') {
        validators.push(Validators.email);
      }
      const initialValue = field.type === 'REFERENCE' ? [] : null;
      formControls[field.name] = [initialValue, validators];
    });
    this.editorForm = this.fb.group(formControls);

    if (this.isEditMode && this.recordId) {
      this.recordService.getRecord(this.entityKey, this.recordId).subscribe(record => {
        this.editorForm.patchValue(record.data);
      });
    }
  }

  onSubmit(): void {
    if (this.editorForm.invalid) {
      return;
    }

    const request = { data: this.editorForm.value };
    const operation = this.isEditMode && this.recordId
      ? this.recordService.updateRecord(this.entityKey, this.recordId, request)
      : this.recordService.createRecord(this.entityKey, request);

    operation.subscribe(() => {
      this.router.navigate(['/records', this.entityKey]);
    });
  }
}
