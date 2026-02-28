import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { EmailTemplateService } from '../../core/services/email-template.service';
import { WhiteLabelService } from '../../core/services/white-label.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { EmailTemplate } from '../../core/models/email-template.model';
import { ModalService } from '../../core/services/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../core/services/toast.service';

/**
 * @class SettingsComponent
 * @description
 * Il pannello di controllo per gli Admin.
 * Permette di configurare tutto: dal nome dell'app alla lingua,
 * fino alla creazione di nuovi temi grafici personalizzati.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  // --- STRUMENTI ---
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private emailTemplateService = inject(EmailTemplateService);
  private whiteLabelService = inject(WhiteLabelService);
  private themeService = inject(ThemeService);
  public modalService = inject(ModalService);
  public i18nService = inject(I18nService);
  private toastService = inject(ToastService);

  // --- DATI ---
  public settingsForm!: FormGroup;
  public emailTemplates$!: Observable<EmailTemplate[]>;
  public themes: Theme[] = [];
  
  // Variabili per il "Creatore di Temi"
  public showThemeDesigner = false;
  public isEditingTheme = false;
  public editingThemeId: string | null = null;
  public newThemeName = '';

  /**
   * All'avvio carichiamo i temi e prepariamo il modulo.
   */
  ngOnInit(): void {
    this.refreshThemes();
    this.initForm();
    this.emailTemplates$ = this.emailTemplateService.templates$;
    this.emailTemplateService.loadEmailTemplates().subscribe();

    // Carichiamo le impostazioni attuali
    this.settingsService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue(settings);
    });

    this.whiteLabelService.config$.pipe(take(1)).subscribe(config => {
      this.settingsForm.patchValue({
        branding: {
          appName: config.appName,
          logoUrl: config.logoUrl,
          language: config.language,
          layoutMode: config.layoutMode,
          themeId: config.themeId
        }
      });
    });
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      branding: this.fb.group({
        appName: ['', Validators.required],
        logoUrl: [''],
        language: ['en'],
        layoutMode: ['sidebar'],
        themeId: ['coder']
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

    // Anteprima in tempo reale
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

  /**
   * Mostra il pannello per creare un nuovo tema.
   */
  openThemeDesigner(): void {
    this.isEditingTheme = false;
    this.editingThemeId = null;
    this.newThemeName = '';
    this.showThemeDesigner = true;
  }

  /**
   * Apre il designer caricando i dati di un tema esistente.
   */
  editTheme(theme: Theme, event: Event): void {
    event.stopPropagation();
    this.isEditingTheme = true;
    this.editingThemeId = theme.id;
    this.newThemeName = theme.name;
    
    // Carichiamo i colori nel form
    this.settingsForm.get('themeDesigner')?.patchValue({
      primary: this.rgbToHex(theme.colors['--color-primary']),
      accent: this.rgbToHex(theme.colors['--color-accent']),
      text: this.rgbToHex(theme.colors['--color-text']),
      bgBase: this.rgbToHex(theme.colors['--color-bg-base']),
      bgSurface: this.rgbToHex(theme.colors['--color-bg-surface'])
    });

    this.showThemeDesigner = true;
    this.themeService.setTheme(theme.id);
  }

  /**
   * Salva o aggiorna il tema.
   */
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

  /**
   * Elimina un tema personalizzato.
   */
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
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  private rgbToHex(rgb: string): string {
    if (!rgb) return '#000000';
    const parts = rgb.split(',').map(p => parseInt(p.trim()));
    if (parts.length < 3) return '#000000';
    return "#" + ((1 << 24) + (parts[0] << 16) + (parts[1] << 8) + parts[2]).toString(16).slice(1);
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.SETTINGS');
    this.modalService.openInfo('Guida Rapida', info);
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) return;
    const formValue = this.settingsForm.value;
    this.themeService.setTheme(formValue.branding.themeId);
    this.whiteLabelService.updateConfig({
      appName: formValue.branding.appName,
      logoUrl: formValue.branding.logoUrl,
      language: formValue.branding.language,
      layoutMode: formValue.branding.layoutMode,
      themeId: formValue.branding.themeId
    });
    this.settingsService.updateSettings(formValue).subscribe(() => {
      this.toastService.success('Configurazioni salvate!');
    });
  }
}
