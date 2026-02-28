import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subject, forkJoin, Observable } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { EntityDefinition, Field } from 'app/configurator/models/entity-definition.model';
import { Group } from 'app/configurator/models/group.model';
import { GroupService } from 'app/configurator/services/group.service';
import { ToggleSwitchComponent } from 'app/common/components/toggle-switch/toggle-switch.component';
import { EmailTemplate } from 'app/configurator/models/email-template.model';
import { EmailTemplateService } from 'app/configurator/services/email-template.service';
import { I18nService } from 'app/common/services/i18n.service';

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
  private emailTemplateService = inject(EmailTemplateService);
  public i18nService = inject(I18nService);

  public editorForm!: FormGroup;
  public isEditMode = false;
  private entityKey: string | null = null;
  private destroy$ = new Subject<void>();

  public activeTab: 'UI' | 'JSON' = 'UI';
  public jsonContentControl = this.fb.control('');
  public jsonError: string | null = null;

  public allGroups: Group[] = [];
  public allEntities: EntityDefinition[] = [];
  public emailTemplates$!: Observable<EmailTemplate[]>;
  public fieldTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'EMAIL', 'ENUM', 'REFERENCE'];

  get fields(): FormArray {
    return this.editorForm.get('fields') as FormArray;
  }

  ngOnInit(): void {
    this.entityKey = this.route.snapshot.paramMap.get('key');
    this.isEditMode = !!this.entityKey;
    this.initForm();
    this.loadDependencies();

    if (this.isEditMode && this.entityKey) {
      this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe(def => {
        this.fields.clear();
        this.editorForm.patchValue(def);
        
        // Handle notifications enabled state
        if (def.notificationConfig) {
          this.editorForm.get('notificationsEnabled')?.setValue(true);
          if (def.notificationConfig.to) {
            this.editorForm.get('notificationConfig.to')?.setValue(def.notificationConfig.to.join(', '));
          }
        } else {
          this.editorForm.get('notificationsEnabled')?.setValue(false);
        }

        this.jsonContentControl.setValue(JSON.stringify(def, null, 2));
        def.fields.forEach(field => this.addField(field));
        
        // Transform ACL from lists to dictionaries for the form
        if (def.acl) {
          Object.keys(def.acl).forEach(action => {
            const actionAcl = (def.acl as any)[action] as string[];
            const actionGroup = this.editorForm.get(`acl.${action}`) as FormGroup;
            if (actionGroup) {
              const patches: any = {};
              actionAcl.forEach(groupName => {
                patches[groupName] = true;
              });
              actionGroup.patchValue(patches);
            }
          });
        }
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
      historyEnabled: [false],
      acl: this.fb.group({
        read: this.fb.group({}),
        write: this.fb.group({}),
        delete: this.fb.group({}),
        search: this.fb.group({})
      }),
      fields: this.fb.array([]),
      notificationsEnabled: [false],
      notificationConfig: this.fb.group({
        to: [''],
        subject: [''],
        createTemplateId: [null],
        updateTemplateId: [null],
        deleteTemplateId: [null]
      })
    });
  }

  private loadDependencies(): void {
    this.emailTemplates$ = this.emailTemplateService.templates$;
    this.emailTemplateService.loadEmailTemplates().subscribe();

    forkJoin({
      groups: this.groupService.loadGroups(),
      entities: this.entityDefinitionService.loadEntityDefinitions()
    }).subscribe(({ groups, entities }) => {
      this.allGroups = groups;
      this.allEntities = entities;
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

  addField(field?: Field): void {
    console.log('Aggiunta di un nuovo campo...', field);
    const fieldGroup = this.fb.group({
      name: [field?.name || '', Validators.required],
      type: [field?.type || 'STRING', Validators.required],
      required: [field?.required || false],
      maxLen: [field?.maxLen],
      pattern: [field?.pattern],
      min: [field?.min],
      max: [field?.max],
      enumValues: this.fb.array(field?.enumValues || []),
      referenceEntityKey: [field?.referenceEntityKey || '']
    });
    this.fields.push(fieldGroup);
    console.log('Totale campi ora:', this.fields.length);
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

    // Handle notifications logic
    if (this.activeTab === 'UI') {
      if (!formValue.notificationsEnabled) {
        formValue.notificationConfig = null;
      } else if (formValue.notificationConfig?.to) {
        formValue.notificationConfig.to = (formValue.notificationConfig.to as string).split(',').map(s => s.trim()).filter(s => s);
      }
      delete formValue.notificationsEnabled;
    }

    // Convert ACL dictionaries to lists of group names
    if (formValue.acl) {
      Object.keys(formValue.acl).forEach(action => {
        const actionDict = formValue.acl[action];
        formValue.acl[action] = Object.keys(actionDict).filter(groupName => actionDict[groupName]);
      });
    }

    const operation = this.isEditMode && this.entityKey
      ? this.entityDefinitionService.updateEntityDefinition(this.entityKey, formValue)
      : this.entityDefinitionService.createEntityDefinition(formValue);
    operation.subscribe(() => this.router.navigate(['/entity-definitions']));
  }

  showUsage(): void {
    // ... (implementation for showing info modals)
  }
}
