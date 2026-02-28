import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmailTemplate } from 'app/configurator/models/email-template.model';
import { EmailTemplateService } from 'app/configurator/services/email-template.service';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FilterCondition, FilterOperator } from 'app/consumer-app/services/filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-template-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './email-template-list.component.html',
})
export class EmailTemplateListComponent implements OnInit, OnDestroy {
  private emailTemplateService = inject(EmailTemplateService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  public i18nService = inject(I18nService);
  private destroy$ = new Subject<void>();

  public allTemplates: EmailTemplate[] = [];
  public filteredTemplates: EmailTemplate[] = [];

  // --- QUERY BUILDER ---
  public showFilters = false;
  public filterRows: FilterCondition[] = [];
  public availableOperators: { label: string, value: FilterOperator }[] = [
    { label: 'Uguale', value: 'eq' },
    { label: 'Contiene', value: 'like' }
  ];
  public columns = [
    { name: 'name', label: 'Nome Template' }
  ];

  ngOnInit(): void {
    this.emailTemplateService.templates$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(templates => {
      this.allTemplates = templates;
      this.applyLocalFilters();
    });

    this.emailTemplateService.loadEmailTemplates().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyLocalFilters(): void {
    if (this.filterRows.length === 0) {
      this.filteredTemplates = [...this.allTemplates];
    } else {
      this.filteredTemplates = this.allTemplates.filter(t => {
        return this.filterRows.every(row => {
          if (!row.field || row.value === '') return true;
          const val = String((t as any)[row.field] || '').toLowerCase();
          const filterVal = String(row.value).toLowerCase();
          if (row.op === 'eq') return val === filterVal;
          if (row.op === 'like') return val.includes(filterVal);
          return true;
        });
      });
    }
    this.cdr.detectChanges();
  }

  addFilterRow(): void {
    this.filterRows.push({ field: 'name', op: 'like', value: '' });
    this.showFilters = true;
  }

  removeFilterRow(index: number): void {
    this.filterRows.splice(index, 1);
    this.applyLocalFilters();
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.EMAIL_TEMPLATES');
    this.modalService.openInfo('Guida Rapida: Template Email', info);
  }

  onDelete(id: string, name: string): void {
    this.modalService.confirm(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare il template <strong>${name}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.emailTemplateService.deleteEmailTemplate(id).subscribe();
    });
  }
}
