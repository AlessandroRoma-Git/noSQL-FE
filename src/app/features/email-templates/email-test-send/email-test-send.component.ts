
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmailTemplate } from '../../../core/models/email-template.model';
import { EmailService } from '../../../core/services/email.service';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-email-test-send',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-test-send.component.html',
})
export class EmailTestSendComponent implements OnInit {
  @Input() template!: EmailTemplate;

  private fb = inject(FormBuilder);
  private emailService = inject(EmailService);
  public modalService = inject(ModalService);

  public testForm!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const placeholderControls: { [key: string]: any } = {};
    this.template.placeholders.forEach(p => {
      placeholderControls[p] = ['', Validators.required];
    });

    this.testForm = this.fb.group({
      to: ['', [Validators.required, Validators.email]],
      subject: [`Test for: ${this.template.name}`, Validators.required],
      placeholders: this.fb.group(placeholderControls)
    });
  }

  onSubmit(): void {
    if (this.testForm.invalid) {
      return;
    }

    const formValue = this.testForm.value;
    const request = {
      ...formValue,
      templateId: this.template.id
    };

    this.emailService.sendEmail(request).subscribe(() => {
      this.modalService.openInfo('Success', `Test email sent successfully to ${formValue.to}.`);
    });
  }
}
