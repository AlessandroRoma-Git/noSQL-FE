
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { ModalService } from '../../../core/services/modal.service';
import { EntityDefinition, Field } from '../../../core/models/entity-definition.model';
import { Group } from '../../../core/models/group.model';
import { GroupService } from '../../../core/services/group.service';
import { ToggleSwitchComponent } from '../../../shared/components/toggle-switch/toggle-switch.component';

@Component({
  selector: 'app-entity-definition-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ToggleSwitchComponent],
  templateUrl: './entity-definition-editor.component.html',
})
export class EntityDefinitionEditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private entityDefinitionService = inject(EntityDefinitionService);
  private groupService = inject(GroupService);
  private modalService = inject(ModalService);

  public editorForm!: FormGroup;
  public isEditMode = false;
  private entityKey: string | null = null;
  private destroy$ = new Subject<void>();

  public activeTab: 'UI' | 'JSON' = 'UI';
  public jsonContentControl = this.fb.control('');
  public jsonError: string | null = null;

  public allGroups: Group[] = [];
  public fieldTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'EMAIL', 'ENUM'];

  get fields(): FormArray {
    return this.editorForm.get('fields') as FormArray;
  }

  ngOnInit(): void {
    this.entityKey = this.route.snapshot.paramMap.get('key');
    this.isEditMode = !!this.entityKey;
    this.initForm();
    this.loadGroups();

    if (this.isEditMode && this.entityKey) {
      this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe(def => {
        this.editorForm.patchValue(def);
        this.jsonContentControl.setValue(JSON.stringify(def, null, 2));
        def.fields.forEach(field => this.addField(field));
        this.setAclControls(def.acl);
      });
    }

    this.jsonContentControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(json => {
      try {
        const parsed = JSON.parse(json || '{}');
        this.editorForm.patchValue(parsed);
        this.jsonError = null;
      } catch (e) {
        this.jsonError = 'Invalid JSON format.';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.editorForm = this.fb.group({
      entityKey: ['', Validators.required],
      label: ['', Validators.required],
      acl: this.fb.group({
        read: this.fb.group({}),
        write: this.fb.group({}),
        delete: this.fb.group({}),
        search: this.fb.group({})
      }),
      fields: this.fb.array([])
    });
  }

  private loadGroups(): void {
    this.groupService.getGroups().subscribe(groups => {
      this.allGroups = groups;
      const aclRead = this.editorForm.get('acl.read') as FormGroup;
      const aclWrite = this.editorForm.get('acl.write') as FormGroup;
      const aclDelete = this.editorForm.get('acl.delete') as FormGroup;
      const aclSearch = this.editorForm.get('acl.search') as FormGroup;
      groups.forEach(group => {
        aclRead.addControl(group.name, this.fb.control(false));
        aclWrite.addControl(group.name, this.fb.control(false));
        aclDelete.addControl(group.name, this.fb.control(false));
        aclSearch.addControl(group.name, this.fb.control(false));
      });
    });
  }

  private setAclControls(acl: any): void {
    if (!acl) return;
    Object.keys(acl).forEach(key => {
      const group = this.editorForm.get(`acl.${key}`);
      if (group) {
        group.patchValue(acl[key]);
      }
    });
  }

  addField(field?: Field): void {
    const fieldGroup = this.fb.group({
      name: [field?.name || '', Validators.required],
      type: [field?.type || 'STRING', Validators.required],
      required: [field?.required || false],
      maxLen: [field?.maxLen],
      pattern: [field?.pattern],
      min: [field?.min],
      max: [field?.max],
      enumValues: this.fb.array(field?.enumValues || [])
    });
    this.fields.push(fieldGroup);
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  getEnumValues(fieldGroup: AbstractControl): FormArray {
    return fieldGroup.get('enumValues') as FormArray;
  }

  addEnumValue(fieldGroup: AbstractControl): void {
    this.getEnumValues(fieldGroup).push(this.fb.control('', Validators.required));
  }

  removeEnumValue(fieldGroup: AbstractControl, index: number): void {
    this.getEnumValues(fieldGroup).removeAt(index);
  }

  onSubmit(): void {
    if (this.editorForm.invalid) return;
    const formValue = this.activeTab === 'UI' ? this.editorForm.value : JSON.parse(this.jsonContentControl.value || '{}');
    const operation = this.isEditMode && this.entityKey
      ? this.entityDefinitionService.updateEntityDefinition(this.entityKey, formValue)
      : this.entityDefinitionService.createEntityDefinition(formValue);
    operation.subscribe(() => this.router.navigate(['/entity-definitions']));
  }

  showUsage(): void {
    // ... (implementation for showing info modals)
  }
}
