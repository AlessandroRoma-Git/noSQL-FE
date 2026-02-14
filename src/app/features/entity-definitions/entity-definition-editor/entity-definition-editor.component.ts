
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { AclDto, CreateEntityDefinitionRequest, FieldDefinitionDto, UpdateEntityDefinitionRequest } from '../../../core/models/entity-definition.model';
import { FieldType } from '../../../core/models/entity-definition.model';

@Component({
  selector: 'app-entity-definition-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './entity-definition-editor.component.html',
  styleUrls: ['./entity-definition-editor.component.css']
})
export class EntityDefinitionEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private entityDefService = inject(EntityDefinitionService);

  editorForm!: FormGroup;
  isEditMode = false;
  private entityKey: string | null = null;
  fieldTypes: FieldType[] = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'EMAIL', 'ENUM'];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.entityKey = this.route.snapshot.paramMap.get('key');
    this.isEditMode = !!this.entityKey;

    if (this.isEditMode && this.entityKey) {
      this.editorForm.get('entityKey')?.disable();
      this.entityDefService.getEntityDefinition(this.entityKey).subscribe(def => {
        this.editorForm.patchValue({
          entityKey: def.entityKey,
          label: def.label,
          acl: {
            read: def.acl?.read?.join(', ') || '',
            write: def.acl?.write?.join(', ') || '',
            delete: def.acl?.delete?.join(', ') || '',
            search: def.acl?.search?.join(', ') || '',
          }
        });
        // Clear existing fields before patching new ones
        this.fields.clear();
        def.fields.forEach(field => this.addField(field));
      });
    }
  }

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      entityKey: ['', [Validators.required, Validators.pattern('^[a-z][a-z0-9_]{1,48}[a-z0-9]$')]],
      label: ['', Validators.required],
      fields: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      acl: this.fb.group({
        read: [''],
        write: [''],
        delete: [''],
        search: ['']
      })
    });
  }

  // --- Fields FormArray methods ---
  get fields(): FormArray {
    return this.editorForm.get('fields') as FormArray;
  }

  createFieldGroup(field?: FieldDefinitionDto): FormGroup {
    const group = this.fb.group({
      name: [field?.name || '', Validators.required],
      type: [field?.type || 'STRING', Validators.required],
      required: [field?.required || false],
      min: [field?.min],
      max: [field?.max],
      maxLen: [field?.maxLen],
      pattern: [field?.pattern],
      enumValues: this.fb.array(field?.enumValues?.map(val => this.fb.control(val, Validators.required)) || [])
    });

    group.get('type')?.valueChanges.subscribe(type => {
      if (type) {
        this.updateFieldValidators(group, type);
      }
    });

    const initialType = group.get('type')?.value;
    if (initialType) {
        this.updateFieldValidators(group, initialType);
    }

    return group;
  }

  private updateFieldValidators(fieldGroup: FormGroup, type: FieldType): void {
    const enumValues = fieldGroup.get('enumValues') as FormArray;
    if (type === 'ENUM') {
      if (enumValues.length === 0) {
        this.addEnumValue(fieldGroup);
      }
      enumValues.setValidators([Validators.required, Validators.minLength(1)]);
    } else {
      enumValues.clear();
      enumValues.clearValidators();
    }
    enumValues.updateValueAndValidity();
  }

  addField(field?: FieldDefinitionDto): void {
    this.fields.push(this.createFieldGroup(field));
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  // --- EnumValues FormArray methods ---
  getEnumValues(fieldGroup: FormGroup | any): FormArray {
    return fieldGroup.get('enumValues') as FormArray;
  }

  addEnumValue(fieldGroup: FormGroup | any): void {
    this.getEnumValues(fieldGroup).push(this.fb.control('', Validators.required));
  }

  removeEnumValue(fieldGroup: FormGroup | any, index: number): void {
    this.getEnumValues(fieldGroup).removeAt(index);
  }

  // --- Form Submission ---
  onSubmit(): void {
    if (this.editorForm.invalid) {
      this.editorForm.markAllAsTouched();
      return;
    }

    const formValue = this.editorForm.getRawValue();

    const acl: AclDto = Object.entries(formValue.acl).reduce((acc, [key, value]) => {
      const roles = (value as string).split(',').map(r => r.trim()).filter(r => r);
      if (roles.length > 0) {
        acc[key as keyof AclDto] = roles;
      }
      return acc;
    }, {} as AclDto);

    const request: CreateEntityDefinitionRequest | UpdateEntityDefinitionRequest = {
      label: formValue.label,
      fields: formValue.fields.map((field: any) => {
        const cleanField: FieldDefinitionDto = {
          name: field.name,
          type: field.type,
          required: field.required,
        };
        if (field.type === 'STRING') {
          if (field.maxLen) cleanField.maxLen = field.maxLen;
          if (field.pattern) cleanField.pattern = field.pattern;
        } else if (field.type === 'NUMBER') {
          if (field.min != null) cleanField.min = field.min;
          if (field.max != null) cleanField.max = field.max;
        } else if (field.type === 'ENUM') {
          cleanField.enumValues = field.enumValues.filter((v: string | null) => v);
        }
        return cleanField;
      }),
      acl: acl
    };

    const saveOperation = this.isEditMode
      ? this.entityDefService.updateEntityDefinition(this.entityKey!, request as UpdateEntityDefinitionRequest)
      : this.entityDefService.createEntityDefinition({ ...request, entityKey: formValue.entityKey });

    saveOperation.subscribe({
      next: () => this.router.navigate(['/entity-definitions']),
      error: (err) => console.error('Failed to save entity definition', err)
    });
  }
}
