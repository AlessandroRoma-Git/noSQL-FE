
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { EmailTemplate } from '../../../core/models/email-template.model';
import { EmailTemplateService } from '../../../core/services/email-template.service';

@Component({
  selector: 'app-email-template-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-template-list.component.html',
  styleUrls: ['./email-template-list.component.css']
})
export class EmailTemplateListComponent implements OnInit {
  private emailTemplateService = inject(EmailTemplateService);
  public templates$!: Observable<EmailTemplate[]>;

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.templates$ = this.emailTemplateService.getEmailTemplates();
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this email template?')) {
      this.emailTemplateService.deleteEmailTemplate(id).subscribe(() => {
        this.loadTemplates(); // Refresh the list
      });
    }
  }
}
