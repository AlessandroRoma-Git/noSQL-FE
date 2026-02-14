
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { EmailTemplate } from '../../../core/models/email-template.model';
import { EmailTemplateService } from '../../../core/services/email-template.service';
import { ModalService } from '../../../core/services/modal.service';
import { filter } from 'rxjs/operators';

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
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.templates$ = this.emailTemplateService.getEmailTemplates();
  }

  onDelete(id: string, name: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete the email template <strong>${name}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.emailTemplateService.deleteEmailTemplate(id).subscribe(() => {
        this.loadTemplates();
      });
    });
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
    const curlCommand = `curl -X POST http://localhost:8088/api/v1/email/send \\
-H "Authorization: Bearer YOUR_JWT_TOKEN" \\
-H "Content-Type: application/json" \\
-d '${JSON.stringify(samplePayload)}'`;

    const content = `
      <p>Here is an example of how to send an email using the <strong>${template.name}</strong> template.</p>

      <h4 class="mt-4 font-semibold">Send Email Endpoint</h4>
      <p><code>POST /api/v1/email/send</code></p>

      <h4 class="mt-4 font-semibold">Sample Payload</h4>
      <pre class="bg-gray-100 p-2 rounded-md text-sm"><code>${payloadString}</code></pre>

      <h4 class="mt-4 font-semibold">cURL Example</h4>
      <pre class="bg-gray-100 p-2 rounded-md text-sm"><code>${curlCommand}</code></pre>
    `;

    this.modalService.open({ title, content });
  }
}
