import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SettingsService } from 'app/configurator/services/settings.service';
import { EmailTemplateService } from 'app/configurator/services/email-template.service';
import { WhiteLabelService } from 'app/common/services/white-label.service';
import { ThemeService, Theme } from 'app/common/services/theme.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { EmailTemplate } from 'app/configurator/models/email-template.model';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';
import { ToastService } from 'app/common/services/toast.service';

/**
 * @class SettingsComponent
 * @description Pannello di controllo Admin per branding e configurazioni di sistema.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private emailTemplateService = inject(EmailTemplateService);
  private whiteLabelService = inject(WhiteLabelService);
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);
  public modalService = inject(ModalService);
  public i18nService = inject(I18nService);
  private toastService = inject(ToastService);

  public settingsForm!: FormGroup;
  public emailTemplates$!: Observable<EmailTemplate[]>;
  public themes: Theme[] = [];
  
  public showThemeDesigner = false;
  public isEditingTheme = false;
  public editingThemeId: string | null = null;
  public newThemeName = '';

  ngOnInit(): void {
    this.initForm();
    this.refreshThemes(); // Carichiamo i temi (inclusi quelli salvati nel browser)
    
    this.emailTemplates$ = this.emailTemplateService.templates$;
    this.emailTemplateService.loadEmailTemplates().subscribe();

    this.settingsService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue(settings);
    });

    this.whiteLabelService.config$.pipe(take(1)).subscribe(config => {
      // Usiamo un piccolo ritardo per assicurarci che il select abbia già le opzioni caricate
      setTimeout(() => {
        this.settingsForm.get('branding')?.patchValue({
          appName: config.appName,
          logoUrl: config.logoUrl,
          language: config.language,
          themeId: config.themeId,
          defaults: {
            desktop: config.defaults.desktop,
            tablet: config.defaults.tablet,
            mobile: config.defaults.mobile
          }
        }, { emitEvent: false });

        // Se stiamo usando un tema personalizzato, carichiamo i suoi colori nel designer
        const currentTheme = this.themes.find(t => t.id === config.themeId);
        if (currentTheme && currentTheme.isCustom) {
          this.settingsForm.get('themeDesigner')?.patchValue({
            primary: this.rgbToHex(currentTheme.colors['--color-primary']),
            accent: this.rgbToHex(currentTheme.colors['--color-accent']),
            text: this.rgbToHex(currentTheme.colors['--color-text']),
            bgBase: this.rgbToHex(currentTheme.colors['--color-bg-base']),
            bgSurface: this.rgbToHex(currentTheme.colors['--color-bg-surface'])
          }, { emitEvent: false });
        }
        
        this.cdr.detectChanges(); // Forza l'aggiornamento grafico del select
      }, 0);
    });
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      branding: this.fb.group({
        appName: ['', Validators.required],
        logoUrl: [''],
        language: ['en'],
        themeId: ['coder'],
        defaults: this.fb.group({
          desktop: ['sidebar'],
          tablet: ['navbar'],
          mobile: ['bottom-nav']
        })
      }),
      themeDesigner: this.fb.group({
        primary: ['#73ef69'],
        accent: ['#db2777'],
        text: ['#dcdcdc'],
        bgBase: ['#0f0f14'],
        bgSurface: ['#191923']
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

    this.settingsForm.get('themeDesigner')?.valueChanges.subscribe(colors => {
      if (this.showThemeDesigner) {
        this.themeService.previewColors({
          '--color-primary': this.hexToRgb(colors.primary),
          '--color-accent': this.hexToRgb(colors.accent),
          '--color-text': this.hexToRgb(colors.text),
          '--color-bg-base': this.hexToRgb(colors.bgBase),
          '--color-bg-surface': this.hexToRgb(colors.bgSurface)
        });
      }
    });
  }

  openThemeDesigner(): void {
    this.isEditingTheme = false;
    this.editingThemeId = null;
    this.newThemeName = '';
    this.showThemeDesigner = true;
  }

  editTheme(theme: Theme, event: Event): void {
    event.stopPropagation();
    this.isEditingTheme = true;
    this.editingThemeId = theme.id;
    this.newThemeName = theme.name;
    this.settingsForm.get('themeDesigner')?.patchValue({
      primary: this.rgbToHex(theme.colors['--color-primary']),
      accent: this.rgbToHex(theme.colors['--color-accent']),
      text: this.rgbToHex(theme.colors['--color-text']),
      bgBase: this.rgbToHex(theme.colors['--color-bg-base']),
      bgSurface: this.rgbToHex(theme.colors['--color-bg-surface'])
    }, { emitEvent: false });
    this.showThemeDesigner = true;
    this.themeService.setTheme(theme.id);
  }

  saveNewTheme(): void {
    if (!this.newThemeName.trim()) {
      this.toastService.error('Inserisci un nome per il tema!');
      return;
    }
    const colors = this.settingsForm.get('themeDesigner')?.value;
    const cssVars = {
      '--color-primary': this.hexToRgb(colors.primary),
      '--color-accent': this.hexToRgb(colors.accent),
      '--color-text': this.hexToRgb(colors.text),
      '--color-bg-base': this.hexToRgb(colors.bgBase),
      '--color-bg-surface': this.hexToRgb(colors.bgSurface)
    };
    if (this.isEditingTheme && this.editingThemeId) {
      this.themeService.updateCustomTheme(this.editingThemeId, this.newThemeName, cssVars);
      this.toastService.success('Tema aggiornato!');
    } else {
      const newId = this.themeService.saveCustomTheme(this.newThemeName, cssVars);
      this.settingsForm.get('branding.themeId')?.setValue(newId);
      this.toastService.success('Nuovo tema salvato!');
    }
    this.refreshThemes();
    this.showThemeDesigner = false;
    this.isEditingTheme = false;
    this.editingThemeId = null;
    this.newThemeName = '';
  }

  deleteTheme(themeId: string, event: Event): void {
    event.stopPropagation();
    this.modalService.confirm('Elimina Tema', 'Sei sicuro?').subscribe(confirmed => {
      if (confirmed) {
        this.themeService.deleteCustomTheme(themeId);
        this.refreshThemes();
        this.toastService.info('Tema eliminato.');
      }
    });
  }

  private refreshThemes(): void {
    this.themes = this.themeService.getThemes();
    this.cdr.detectChanges();
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  private rgbToHex(rgb: string | undefined): string {
    if (!rgb) return '#000000';
    // Assicuriamoci di gestire sia "255, 255, 255" che "255,255,255"
    const parts = rgb.split(',').map(p => parseInt(p.trim()));
    if (parts.length < 3 || parts.some(isNaN)) return '#000000';
    return "#" + ((1 << 24) + (parts[0] << 16) + (parts[1] << 8) + parts[2]).toString(16).slice(1);
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.SETTINGS');
    this.modalService.openInfo('Guida Rapida', info);
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) return;
    const formValue = this.settingsForm.value;
    
    // Aggiorniamo la configurazione nel servizio
    this.whiteLabelService.updateConfig({
      appName: formValue.branding.appName,
      logoUrl: formValue.branding.logoUrl,
      language: formValue.branding.language,
      themeId: formValue.branding.themeId,
      defaults: formValue.branding.defaults
    });

    this.themeService.setTheme(formValue.branding.themeId);

    this.settingsService.updateSettings(formValue).subscribe(() => {
      this.toastService.success('Configurazioni salvate con successo!');
    });
  }
}
