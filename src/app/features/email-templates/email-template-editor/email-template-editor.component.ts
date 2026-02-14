
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmailTemplateService } from '../../../core/services/email-template.service';
import { CreateEmailTemplateRequest, EmailTemplate, UpdateEmailTemplateRequest } from '../../../core/models/email-template.model';
import { ModalService } from '../../../core/services/modal.service';
import { Observable, Subject } from 'rxjs';
import { map, startWith, debounceTime, takeUntil } from 'rxjs/operators';
import { ToggleSwitchComponent } from '../../../shared/components/toggle-switch/toggle-switch.component';

@Component({
  selector: 'app-email-template-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToggleSwitchComponent],
  templateUrl: './email-template-editor.component.html',
  styleUrls: ['./email-template-editor.component.css']
})
export class EmailTemplateEditorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private emailTemplateService = inject(EmailTemplateService);
  private modalService = inject(ModalService);

  editorForm!: FormGroup;
  jsonContentControl = new FormControl('');
  jsonError: string | null = null;
  activeTab: 'ui' | 'json' = 'ui';

  isEditMode = false;
  private currentTemplate: EmailTemplate | null = null;
  private templateId: string | null = null;
  detectedPlaceholders$!: Observable<string[]>;
  private destroy$ = new Subject<void>();

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupSync();
    this.templateId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.templateId;

    if (this.isEditMode && this.templateId) {
      this.emailTemplateService.getEmailTemplate(this.templateId).subscribe(template => {
        this.currentTemplate = template;
        this.updateFormFromData(template);
      });
    }

    this.detectedPlaceholders$ = this.editorForm.get('htmlContent')!.valueChanges.pipe(
      startWith(this.editorForm.get('htmlContent')!.value),
      map(html => this.extractPlaceholders(html))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      name: ['', Validators.required],
      htmlContent: ['', Validators.required],
      attachments: this.fb.array([])
    });
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
      name: data.name,
      htmlContent: data.htmlContent,
    }, { emitEvent: false });

    this.attachments.clear();
    data.attachments?.forEach((att: any) => this.addAttachment(att, false));
  }

  private getSanitizedFormValue(): CreateEmailTemplateRequest {
    const formValue = this.editorForm.getRawValue();
    return {
      name: formValue.name,
      htmlContent: formValue.htmlContent,
      placeholders: this.extractPlaceholders(formValue.htmlContent),
      attachments: formValue.attachments
    };
  }

  private extractPlaceholders(html: string | null): string[] {
    if (!html) return [];
    const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
    const matches = html.match(regex) || [];
    const uniquePlaceholders = new Set(matches.map(p => p.replace(/[{}]/g, '').trim()));
    return Array.from(uniquePlaceholders);
  }

  showInfo(section: 'details' | 'placeholders' | 'attachments' | 'usage'): void {
    let title = '';
    let content = '';

    switch (section) {
      case 'details':
        title = 'Template Details';
        content = `...`; // Content already defined
        break;
      case 'placeholders':
        title = 'Detected Placeholders';
        content = `...`; // Content already defined
        break;
      case 'attachments':
        title = 'Attachments';
        content = `...`; // Content already defined
        break;
      case 'usage':
        if (!this.currentTemplate) return;
        const template = this.currentTemplate;
        title = `API Usage for: ${template.name}`;
        const samplePlaceholders = template.placeholders.reduce((acc, key) => {
          acc[key] = 'sample value';
          return acc;
        }, {} as Record<string, string>);
        const samplePayload = { to: "recipient@example.com", subject: "Sample Subject", templateId: template.id, placeholders: samplePlaceholders };
        const payloadString = JSON.stringify(samplePayload, null, 2);
        const curlCommand = `curl -X POST http://localhost:8088/api/v1/email/send \\
-H "Authorization: Bearer YOUR_JWT_TOKEN" \\
-H "Content-Type: application/json" \\
-d '${JSON.stringify(samplePayload)}'`;
        content = `
          <p>Here is an example of how to send an email using the <strong>${template.name}</strong> template.</p>
          <h4 class="mt-4 font-semibold">Send Email Endpoint</h4>
          <p><code>POST /api/v1/email/send</code></p>
          <h4 class="mt-4 font-semibold">Sample Payload</h4>
          <pre class="bg-gray-100 p-2 rounded-md text-sm"><code>${payloadString}</code></pre>
          <h4 class="mt-4 font-semibold">cURL Example</h4>
          <pre class="bg-gray-100 p-2 rounded-md text-sm"><code>${curlCommand}</code></pre>
        `;
        break;
    }
    this.modalService.open({ title, content });
  }

  get attachments(): FormArray {
    return this.editorForm.get('attachments') as FormArray;
  }

  addAttachment(attachment?: any, emitEvent = true): void {
    this.attachments.push(this.fb.group({
      filename: [attachment?.filename || '', Validators.required],
      contentType: [attachment?.contentType || '', Validators.required],
      base64Content: [attachment?.base64Content || '', Validators.required]
    }), { emitEvent });
  }

  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
  }

  onFileChange(event: Event, index: number): void {
    // ... (omitted for brevity)
  }

  onSubmit(): void {
    if (this.editorForm.invalid || this.jsonError) {
      this.editorForm.markAllAsTouched();
      return;
    }

    const request = this.getSanitizedFormValue();

    const saveOperation = this.isEditMode
      ? this.emailTemplateService.updateEmailTemplate(this.templateId!, request as UpdateEmailTemplateRequest)
      : this.emailTemplateService.createEmailTemplate(request);

    saveOperation.subscribe({
      next: () => this.router.navigate(['/email-templates']),
      error: (err) => console.error('Failed to save email template', err)
    });
  }
}
