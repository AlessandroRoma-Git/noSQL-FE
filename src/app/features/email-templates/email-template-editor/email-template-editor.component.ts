
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmailTemplateService } from '../../../core/services/email-template.service';
import { CreateEmailTemplateRequest } from '../../../core/models/email-template.model';
import { ModalService } from '../../../core/services/modal.service';
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-email-template-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EditorModule],
  templateUrl: './email-template-editor.component.html',
  styleUrls: ['./email-template-editor.component.css']
})
export class EmailTemplateEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private emailTemplateService = inject(EmailTemplateService);
  private modalService = inject(ModalService);

  editorForm!: FormGroup;
  activeTab: 'editor' | 'html' = 'editor';

  tinyMceConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    plugins: 'lists link image table code help wordcount',
    height: 500,
  };

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {}

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      name: ['', Validators.required],
      htmlContent: ['', Validators.required],
      placeholders: this.fb.array([]),
      attachments: this.fb.array([])
    });
  }

  showInfo(title: string, content: string): void {
    this.modalService.open({ title, content });
  }

  // --- Placeholders ---
  get placeholders(): FormArray {
    return this.editorForm.get('placeholders') as FormArray;
  }

  addPlaceholder(): void {
    this.placeholders.push(this.fb.control('', Validators.required));
  }

  removePlaceholder(index: number): void {
    this.placeholders.removeAt(index);
  }

  // --- Attachments ---
  get attachments(): FormArray {
    return this.editorForm.get('attachments') as FormArray;
  }

  addAttachment(): void {
    this.attachments.push(this.fb.group({
      filename: ['', Validators.required],
      contentType: ['', Validators.required],
      base64Content: ['', Validators.required]
    }));
  }

  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = (reader.result as string).split(',')[1];
        const attachmentGroup = this.attachments.at(index) as FormGroup;
        attachmentGroup.patchValue({
          filename: file.name,
          contentType: file.type,
          base64Content: base64Content
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Form Submission ---
  onSubmit(): void {
    if (this.editorForm.invalid) {
      this.editorForm.markAllAsTouched();
      return;
    }

    const formValue = this.editorForm.getRawValue();
    const request: CreateEmailTemplateRequest = {
      name: formValue.name,
      htmlContent: formValue.htmlContent,
      placeholders: formValue.placeholders.filter((p: string | null) => p),
      attachments: formValue.attachments
    };

    this.emailTemplateService.createEmailTemplate(request).subscribe({
      next: () => this.router.navigate(['/email-templates']),
      error: (err) => console.error('Failed to create email template', err)
    });
  }
}
