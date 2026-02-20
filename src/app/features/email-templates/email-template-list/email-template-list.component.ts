
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { EmailTemplate } from '../../../core/models/email-template.model';
import { EmailTemplateService } from '../../../core/services/email-template.service';
import { ModalService } from '../../../core/services/modal.service';
import { filter } from 'rxjs/operators';
import { EmailTestSendComponent } from '../email-test-send/email-test-send.component';

@Component({
  selector: 'app-email-template-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-template-list.component.html',
  styleUrls: ['./email-template-list.component.css']
})
export class EmailTemplateListComponent implements OnInit {
  private emailTemplateService = inject(EmailTemplateService);
  private modalService = inject(ModalService);
  public templates$!: Observable<EmailTemplate[]>;

  ngOnInit(): void {
    this.templates$ = this.emailTemplateService.templates$;
    this.emailTemplateService.loadEmailTemplates().subscribe();
  }

  onDelete(id: string, name: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete the email template <strong>${name}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.emailTemplateService.deleteEmailTemplate(id).subscribe();
    });
  }

  onTestSend(template: EmailTemplate): void {
    this.modalService.open(EmailTestSendComponent, { template: template });
  }

  showUsage(template: EmailTemplate): void {
    const title = `API Usage for: ${template.name}`;
    const samplePlaceholders = template.placeholders.reduce((acc, key) => {
      acc[key] = 'sample value';
      return acc;
    }, {} as Record<string, string>);
    const samplePayload = {
      to: "recipient@example.com",
      subject: "Sample Subject",
      templateId: template.id,
      placeholders: samplePlaceholders
    };
    const payloadString = JSON.stringify(samplePayload, null, 2);
    const content = `
      <p>Here is an example of how to send an email using the <strong>${template.name}</strong> template.</p>
      <h4 class="mt-4 font-semibold text-[rgb(var(--color-primary))]">Send Email Endpoint</h4>
      <p><code>POST /api/v1/email/send</code></p>
      <h4 class="mt-4 font-semibold text-[rgb(var(--color-primary))]">Sample Payload</h4>
      <pre class="bg-[rgb(var(--color-bg-base))] p-2 rounded-md text-sm text-[rgb(var(--color-text))]"><code>${payloadString}</code></pre>
    `;
    this.modalService.open({ title, content });
  }
}
