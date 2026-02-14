
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { EmailTemplateService } from '../../../core/services/email-template.service';
import { ModalService } from '../../../core/services/modal.service';
import { EmailTemplate, Attachment } from '../../../core/models/email-template.model';
import { ToggleSwitchComponent } from '../../../shared/components/toggle-switch/toggle-switch.component';
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-email-template-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ToggleSwitchComponent, EditorModule],
  templateUrl: './email-template-editor.component.html',
  styleUrls: ['./email-template-editor.component.css']
})
export class EmailTemplateEditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private emailTemplateService = inject(EmailTemplateService);
  private modalService = inject(ModalService);

  public editorForm!: FormGroup;
  public isEditMode = false;
  private templateId: string | null = null;
  private destroy$ = new Subject<void>();

  public activeTab: 'UI' | 'JSON' = 'UI';
  public jsonContentControl = this.fb.control('');
  public jsonError: string | null = null;

  public detectedPlaceholders$ = new Subject<string[]>();

  public tinyMceConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    plugins: 'lists link image table code help wordcount',
    skin: 'oxide-dark',
    content_css: 'dark',
    height: 500,
  };

  get attachments(): FormArray {
    return this.editorForm.get('attachments') as FormArray;
  }

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!(this.templateId);
    this.initForm();
    this.listenToHtmlContentChanges();

    if (this.isEditMode && this.templateId) {
      this.emailTemplateService.getEmailTemplate(this.templateId).subscribe((template: EmailTemplate) => {
        this.editorForm.patchValue(template);
        this.jsonContentControl.setValue(JSON.stringify(template, null, 2));
        template.attachments?.forEach((att: Attachment) => this.addAttachment(att.filename, att.contentType, att.data));
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
      name: ['', Validators.required],
      htmlContent: [''],
      placeholders: [[] as string[]],
      attachments: this.fb.array([])
    });
  }

  private listenToHtmlContentChanges(): void {
    this.editorForm.get('htmlContent')?.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe((content: string | null) => {
      const regex = /{{\s*(\w+)\s*}}/g;
      const matches = content?.match(regex) || [];
      const placeholders = matches.map((match: string) => match.replace(/[{}]/g, '').trim());
      const uniquePlaceholders = [...new Set(placeholders)];
      this.editorForm.get('placeholders')?.setValue(uniquePlaceholders);
      this.detectedPlaceholders$.next(uniquePlaceholders);
    });
  }

  addAttachment(filename = '', contentType = '', data = ''): void {
    const attachmentForm = this.fb.group({
      filename: [filename, Validators.required],
      contentType: [contentType, Validators.required],
      data: [data, Validators.required]
    });
    this.attachments.push(attachmentForm);
  }

  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
  }

  onFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const attachmentGroup = this.attachments.at(index) as FormGroup;
        attachmentGroup.patchValue({
          filename: file.name,
          contentType: file.type,
          data: base64String.split(',')[1] // Get only the base64 part
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.editorForm.invalid) {
      return;
    }

    const formValue = this.activeTab === 'UI' ? this.editorForm.value : JSON.parse(this.jsonContentControl.value || '{}');

    const operation = this.isEditMode && this.templateId
      ? this.emailTemplateService.updateEmailTemplate(this.templateId, formValue)
      : this.emailTemplateService.createEmailTemplate(formValue);

    operation.subscribe(() => {
      this.router.navigate(['/email-templates']);
    });
  }

  showInfo(topic: string): void {
    // ... (implementation for showing info modals)
  }
}
