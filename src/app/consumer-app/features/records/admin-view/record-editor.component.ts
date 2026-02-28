import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { RecordService } from 'app/consumer-app/services/record.service';
import { ToastService } from 'app/common/services/toast.service';
import { I18nService } from 'app/common/services/i18n.service';
import { EntityDefinition, Field } from 'app/configurator/models/entity-definition.model';
import { ReferenceSearchComponent } from 'app/common/components/reference-search/reference-search.component';
import { RecordHistoryComponent } from '../record-history/record-history.component';
import { AuthService } from 'app/common/services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConsumerRecordEditorComponent } from '../consumer-view/consumer-record-editor.component';

/**
 * @class RecordEditorComponent
 * @description
 * Punto di ingresso per l'editor record. Decide se mostrare l'editor Admin o Consumer.
 */
@Component({
  selector: 'app-record-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ReferenceSearchComponent, RecordHistoryComponent, ConsumerRecordEditorComponent],
  templateUrl: './record-editor.component.html',
})
export class RecordEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private entityDefinitionService = inject(EntityDefinitionService);
  private recordService = inject(RecordService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  public i18nService = inject(I18nService);

  public editorForm!: FormGroup;
  public entityDefinition!: EntityDefinition;
  public isEditMode = false;
  public entityKey!: string;
  public recordId: string | null = null;
  public activeTab: 'data' | 'history' = 'data';
  public isAdmin$!: Observable<boolean>;

  ngOnInit(): void {
    this.entityKey = this.route.snapshot.paramMap.get('entityKey')!;
    this.recordId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recordId;

    this.isAdmin$ = this.authService.systemRoles$.pipe(
      map(roles => roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))
    );

    this.isAdmin$.pipe(take(1)).subscribe(isAdmin => {
      if (isAdmin) {
        this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe({
          next: (def) => {
            this.entityDefinition = def;
            this.buildForm();
          },
          error: () => {
            this.toastService.error('Impossibile caricare lo schema.');
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  private buildForm(): void {
    if (!this.entityDefinition) return;
    const formControls: { [key: string]: any } = {};
    this.entityDefinition.fields.forEach(field => {
      const validators: ValidatorFn[] = [];
      if (field.required) validators.push(Validators.required);
      if (field.type === 'EMAIL') validators.push(Validators.email);
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

  public hasError(fieldName: string, errorType: string): boolean {
    const control = this.editorForm?.get(fieldName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }

  public setTab(tab: 'data' | 'history'): void { this.activeTab = tab; }

  onSubmit(): void {
    if (this.editorForm.invalid) return;
    const request = { data: this.editorForm.value };
    const operation = this.isEditMode && this.recordId
      ? this.recordService.updateRecord(this.entityKey, this.recordId, request)
      : this.recordService.createRecord(this.entityKey, request);
    operation.subscribe(() => this.router.navigate(['/records', this.entityKey]));
  }
}
