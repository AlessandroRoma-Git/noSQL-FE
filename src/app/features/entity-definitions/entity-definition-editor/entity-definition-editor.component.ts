
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
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6">{{ isEditMode ? 'Edit Entity Definition' : 'Create Entity Definition' }}</h1>
      <form [formGroup]="editorForm" (ngSubmit)="onSubmit()" class="space-y-8">

        <!-- Main Details & ACLs -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">Main Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="entityKey" class="label">Entity Key</label>
              <input formControlName="entityKey" id="entityKey" type="text" class="input" [class.bg-gray-100]="isEditMode" placeholder="e.g., blog_posts">
              <div *ngIf="editorForm.get('entityKey')?.touched && editorForm.get('entityKey')?.errors" class="error-text">
                <span *ngIf="editorForm.get('entityKey')?.errors?.['required']">Key is required.</span>
                <span *ngIf="editorForm.get('entityKey')?.errors?.['pattern']">Key must be lowercase with letters, numbers, and underscores.</span>
              </div>
            </div>
            <div>
              <label for="label" class="label">Label</label>
              <input formControlName="label" id="label" type="text" class="input" placeholder="e.g., Blog Posts">
               <div *ngIf="editorForm.get('label')?.touched && editorForm.get('label')?.errors?.['required']" class="error-text">
                Label is required.
              </div>
            </div>
          </div>

          <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">Access Control List (ACL)</h2>
          <p class="text-sm text-gray-500 mb-4">Enter roles separated by commas (e.g., admin, editor). Leave blank for open access.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" formGroupName="acl">
            <div>
              <label for="acl-read" class="label">Read Roles</label>
              <input formControlName="read" id="acl-read" type="text" class="input" placeholder="admin, user">
            </div>
            <div>
              <label for="acl-write" class="label">Write Roles</label>
              <input formControlName="write" id="acl-write" type="text" class="input" placeholder="admin">
            </div>
            <div>
              <label for="acl-delete" class="label">Delete Roles</label>
              <input formControlName="delete" id="acl-delete" type="text" class="input" placeholder="admin">
            </div>
            <div>
              <label for="acl-search" class="label">Search Roles</label>
              <input formControlName="search" id="acl-search" type="text" class="input" placeholder="admin, user">
            </div>
          </div>
        </div>

        <!-- Fields -->
        <div class="bg-white p-6 rounded-lg shadow-md" formArrayName="fields">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-xl font-semibold">Fields</h2>
            <button type="button" (click)="addField()" class="button-primary">Add Field</button>
          </div>
           <div *ngIf="editorForm.get('fields')?.touched && editorForm.get('fields')?.errors?.['minlength']" class="error-text mb-4">
              At least one field is required.
          </div>

          <div *ngFor="let fieldGroup of fields.controls; let i = index" [formGroupName]="i" class="space-y-4 p-4 mb-4 border rounded-md bg-gray-50 relative">
            <button type="button" (click)="removeField(i)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 font-semibold">X</button>

            <!-- Field Main Details -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label [for]="'field-name-' + i" class="label">Field Name</label>
                <input [id]="'field-name-' + i" formControlName="name" placeholder="e.g., title" class="input">
              </div>
              <div>
                <label [for]="'field-type-' + i" class="label">Type</label>
                <select [id]="'field-type-' + i" formControlName="type" class="input">
                  <option *ngFor="let type of fieldTypes" [value]="type">{{ type }}</option>
                </select>
              </div>
              <div class="flex items-end pb-2">
                <label class="flex items-center">
                  <input formControlName="required" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                  <span class="ml-2 text-sm text-gray-600">Required</span>
                </label>
              </div>
            </div>

            <!-- Conditional Validation Fields -->
            <ng-container [ngSwitch]="fieldGroup.get('type')?.value">

              <!-- STRING Type -->
              <div *ngSwitchCase="'STRING'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label [for]="'field-maxlen-' + i" class="label">Max Length</label>
                  <input [id]="'field-maxlen-' + i" formControlName="maxLen" type="number" class="input" placeholder="e.g., 255">
                </div>
                <div>
                  <label [for]="'field-pattern-' + i" class="label">Regex Pattern</label>
                  <input [id]="'field-pattern-' + i" formControlName="pattern" type="text" class="input" placeholder="e.g., ^[A-Za-z]+$">
                </div>
              </div>

              <!-- NUMBER Type -->
              <div *ngSwitchCase="'NUMBER'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label [for]="'field-min-' + i" class="label">Min Value</label>
                  <input [id]="'field-min-' + i" formControlName="min" type="number" class="input" placeholder="e.g., 0">
                </div>
                <div>
                  <label [for]="'field-max-' + i" class="label">Max Value</label>
                  <input [id]="'field-max-' + i" formControlName="max" type="number" class="input" placeholder="e.g., 100">
                </div>
              </div>

              <!-- ENUM Type -->
              <div *ngSwitchCase="'ENUM'" formArrayName="enumValues">
                <label class="label">Enum Values</label>
                <div *ngFor="let enumControl of getEnumValues(fieldGroup).controls; let j = index" class="flex items-center space-x-2 mb-2">
                  <input [formControlName]="j" class="input flex-grow" placeholder="e.g., active">
                  <button type="button" (click)="removeEnumValue(fieldGroup, j)" class="button-danger-sm">Remove</button>
                </div>
                <button type="button" (click)="addEnumValue(fieldGroup)" class="button-secondary-sm mt-2">Add Value</button>
              </div>

            </ng-container>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4">
          <a routerLink="/entity-definitions" class="button-secondary">Cancel</a>
          <button type="submit" [disabled]="editorForm.invalid" class="button-primary disabled:opacity-50">
            {{ isEditMode ? 'Update Definition' : 'Create Definition' }}
          </button>
        </div>

      </form>
    </div>
  `,
  styles: []
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
