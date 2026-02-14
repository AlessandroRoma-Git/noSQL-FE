
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { AclDto, CreateEntityDefinitionRequest, EntityDefinition, FieldDefinitionDto, UpdateEntityDefinitionRequest } from '../../../core/models/entity-definition.model';
import { FieldType } from '../../../core/models/entity-definition.model';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { ModalService } from '../../../core/services/modal.service';
import { ToggleSwitchComponent } from '../../../shared/components/toggle-switch/toggle-switch.component';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-entity-definition-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToggleSwitchComponent],
  templateUrl: './entity-definition-editor.component.html',
  styleUrls: ['./entity-definition-editor.component.css']
})
export class EntityDefinitionEditorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private entityDefService = inject(EntityDefinitionService);
  private modalService = inject(ModalService);
  private groupService = inject(GroupService);

  editorForm!: FormGroup;
  jsonContentControl = new FormControl('');
  jsonError: string | null = null;
  activeTab: 'ui' | 'json' = 'ui';

  isEditMode = false;
  private currentDefinition: EntityDefinition | null = null;
  allGroups: Group[] = [];

  private entityKey: string | null = null;
  fieldTypes: FieldType[] = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'EMAIL', 'ENUM'];
  private destroy$ = new Subject<void>();

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.groupService.getGroups().pipe(
      switchMap(groups => {
        this.allGroups = groups;
        this.buildAclForm();

        this.entityKey = this.route.snapshot.paramMap.get('key');
        this.isEditMode = !!this.entityKey;

        if (this.isEditMode && this.entityKey) {
          this.editorForm.get('entityKey')?.disable();
          return this.entityDefService.getEntityDefinition(this.entityKey);
        }
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe(def => {
      if (def) {
        this.currentDefinition = def;
        this.updateFormFromData(def);
      }
    });

    this.setupSync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      entityKey: ['', [Validators.required, Validators.pattern('^[a-z][a-z0-9_]{1,48}[a-z0-9]$')]],
      label: ['', Validators.required],
      fields: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      acl: this.fb.group({})
    });
  }

  private buildAclForm(): void {
    const aclGroup = this.fb.group({
      read: this.buildPermissionGroup(),
      write: this.buildPermissionGroup(),
      delete: this.buildPermissionGroup(),
      search: this.buildPermissionGroup()
    });
    this.editorForm.setControl('acl', aclGroup);
  }

  private buildPermissionGroup(): FormGroup {
    const group = this.fb.group({});
    this.allGroups.forEach(g => {
      group.addControl(g.name, this.fb.control(false));
    });
    return group;
  }

  private setupSync(): void {
    this.editorForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.activeTab === 'ui') {
        this.jsonContentControl.setValue(JSON.stringify(this.getSanitizedFormValue(), null, 2), { emitEvent: false });
      }
    });

    this.jsonContentControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(jsonString => {
      if (this.activeTab === 'json') {
        try {
          const data = JSON.parse(jsonString || '{}');
          this.updateFormFromData(data);
          this.jsonError = null;
        } catch (e) {
          this.jsonError = 'Invalid JSON format.';
        }
      }
    });
  }

  private updateFormFromData(data: any): void {
    this.editorForm.patchValue({
      entityKey: data.entityKey,
      label: data.label,
    }, { emitEvent: false });

    const aclPatch: any = { read: {}, write: {}, delete: {}, search: {} };
    this.allGroups.forEach(group => {
      aclPatch.read[group.name] = data.acl?.read?.includes(group.name) || false;
      aclPatch.write[group.name] = data.acl?.write?.includes(group.name) || false;
      aclPatch.delete[group.name] = data.acl?.delete?.includes(group.name) || false;
      aclPatch.search[group.name] = data.acl?.search?.includes(group.name) || false;
    });
    this.editorForm.get('acl')?.patchValue(aclPatch, { emitEvent: false });

    this.fields.clear();
    data.fields?.forEach((field: FieldDefinitionDto) => this.addField(field, false));
  }

  private getSanitizedFormValue(): any {
    const formValue = this.editorForm.getRawValue();

    const acl: AclDto = {};
    const aclForm = formValue.acl;
    for (const perm in aclForm) {
      const selectedGroups = Object.keys(aclForm[perm]).filter(groupName => aclForm[perm][groupName]);
      if (selectedGroups.length > 0) {
        (acl as any)[perm] = selectedGroups;
      }
    }

    return {
      entityKey: formValue.entityKey,
      label: formValue.label,
      fields: formValue.fields.map((field: any) => {
        const cleanField: any = { name: field.name, type: field.type, required: field.required };
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
  }

  showUsage(): void {
    if (!this.currentDefinition) return;
    const def = this.currentDefinition;
    const title = `API Usage for: ${def.label}`;
    const samplePayload = def.fields.reduce((acc, field) => {
      let value: any = '';
      switch (field.type) {
        case 'STRING': value = 'string value'; break;
        case 'EMAIL': value = 'user@example.com'; break;
        case 'NUMBER': value = field.min ?? 0; break;
        case 'BOOLEAN': value = true; break;
        case 'DATE': value = new Date().toISOString(); break;
        case 'ENUM': value = field.enumValues?.[0] || 'enum_value'; break;
      }
      acc[field.name] = value;
      return acc;
    }, {} as Record<string, any>);
    const payloadString = JSON.stringify({ data: samplePayload }, null, 2);
    const curlCommand = `curl -X POST http://localhost:8088/api/v1/records/${def.entityKey} \\
-H "Authorization: Bearer YOUR_JWT_TOKEN" \\
-H "Content-Type: application/json" \\
-d '${JSON.stringify({ data: samplePayload })}'`;
    const content = `
      <p>Here are some examples of how to interact with the <strong>${def.entityKey}</strong> entity via the API.</p>
      <h4 class="mt-4 font-semibold">Create Record Endpoint</h4>
      <p><code>POST /api/v1/records/${def.entityKey}</code></p>
      <h4 class="mt-4 font-semibold">Sample Payload</h4>
      <pre class="bg-gray-100 p-2 rounded-md text-sm"><code>${payloadString}</code></pre>
      <h4 class="mt-4 font-semibold">cURL Example</h4>
      <pre class="bg-gray-100 p-2 rounded-md text-sm"><code>${curlCommand}</code></pre>
    `;
    this.modalService.open({ title, content });
  }

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
      if (type) this.updateFieldValidators(group, type);
    });

    const initialType = group.get('type')?.value;
    if (initialType) this.updateFieldValidators(group, initialType);

    return group;
  }

  private updateFieldValidators(fieldGroup: FormGroup, type: FieldType): void {
    const enumValues = fieldGroup.get('enumValues') as FormArray;
    if (type === 'ENUM') {
      if (enumValues.length === 0) this.addEnumValue(fieldGroup);
      enumValues.setValidators([Validators.required, Validators.minLength(1)]);
    } else {
      enumValues.clear();
      enumValues.clearValidators();
    }
    enumValues.updateValueAndValidity();
  }

  addField(field?: FieldDefinitionDto, emitEvent = true): void {
    this.fields.push(this.createFieldGroup(field), { emitEvent });
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  getEnumValues(fieldGroup: any): FormArray {
    return fieldGroup.get('enumValues') as FormArray;
  }

  addEnumValue(fieldGroup: any): void {
    this.getEnumValues(fieldGroup).push(this.fb.control('', Validators.required));
  }

  removeEnumValue(fieldGroup: any, index: number): void {
    this.getEnumValues(fieldGroup).removeAt(index);
  }

  onSubmit(): void {
    if (this.editorForm.invalid || this.jsonError) {
      this.editorForm.markAllAsTouched();
      return;
    }
    const request = this.getSanitizedFormValue();
    const saveOperation = this.isEditMode
      ? this.entityDefService.updateEntityDefinition(this.entityKey!, request)
      : this.entityDefService.createEntityDefinition(request);
    saveOperation.subscribe({
      next: () => this.router.navigate(['/entity-definitions']),
      error: (err) => console.error('Failed to save entity definition', err)
    });
  }
}
