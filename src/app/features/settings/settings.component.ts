import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { EmailTemplateService } from '../../core/services/email-template.service';
import { WhiteLabelService } from '../../core/services/white-label.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { EmailTemplate } from '../../core/models/email-template.model';
import { ModalService } from '../../core/services/modal.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private emailTemplateService = inject(EmailTemplateService);
  private whiteLabelService = inject(WhiteLabelService);
  private modalService = inject(ModalService);
  private i18nService = inject(I18nService);

  public settingsForm!: FormGroup;
  public emailTemplates$!: Observable<EmailTemplate[]>;

  ngOnInit(): void {
    this.initForm();
    this.emailTemplates$ = this.emailTemplateService.templates$;
    this.emailTemplateService.loadEmailTemplates().subscribe();

    this.settingsService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue(settings);
    });

    this.whiteLabelService.config$.pipe(take(1)).subscribe(config => {
      this.settingsForm.patchValue({
        branding: {
          appName: config.appName,
          logoUrl: config.logoUrl,
          language: config.language
        }
      });
    });
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      branding: this.fb.group({
        appName: ['', Validators.required],
        logoUrl: [''],
        language: ['it']
      }),
      email: this.fb.group({
        defaultFrom: ['', [Validators.required, Validators.email]],
        passwordTemplateId: [null],
        recoverPasswordTemplateId: [null]
      }),
      security: this.fb.group({
        maxLoginAttempts: [3, Validators.required]
      }),
      storage: this.fb.group({
        type: ['grid-fs'],
        maxFileSize: [10485760, Validators.required]
      })
    });
  }

  /**
   * Questo metodo apre una finestrella (Modal) che spiega all'utente
   * cosa deve fare in questa pagina.
   */
  showHelp(): void {
    const info = this.i18nService.translate('HELP.SETTINGS');
    this.modalService.openInfo('Guida Rapida: Personalizzazione', info);
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) return;

    const formValue = this.settingsForm.value;

    // Update branding
    this.whiteLabelService.updateConfig({
      appName: formValue.branding.appName,
      logoUrl: formValue.branding.logoUrl,
      language: formValue.branding.language
    });

    // Update settings (mocked backend)
    this.settingsService.updateSettings(formValue).subscribe(() => {
      this.modalService.openInfo('Success', 'Settings and Branding have been saved successfully.');
    });
  }
}
