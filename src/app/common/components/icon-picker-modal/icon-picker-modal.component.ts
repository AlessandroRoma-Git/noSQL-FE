import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';

/**
 * @class IconPickerModalComponent
 * @description
 * Un selettore di icone avanzato basato su FontAwesome 6.
 * Permette di cercare e scegliere l'icona perfetta per il menu.
 */
@Component({
  selector: 'app-icon-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icon-picker-modal.component.html',
})
export class IconPickerModalComponent implements OnInit {
  private modalService = inject(ModalService);
  public i18nService = inject(I18nService);

  @Input() onSelect!: (icon: string) => void;

  public searchTerm = '';
  
  // Icone aggiornate a FontAwesome 6
  public allIcons = [
    'fa-house', 'fa-user', 'fa-users', 'fa-gear', 'fa-gears', 'fa-database', 'fa-table', 'fa-list', 
    'fa-envelope', 'fa-envelope-open', 'fa-bell', 'fa-bell-slash', 'fa-magnifying-glass', 'fa-plus', 
    'fa-circle-plus', 'fa-minus', 'fa-circle-minus', 'fa-trash', 'fa-trash-can', 'fa-pen', 
    'fa-pen-to-square', 'fa-floppy-disk', 'fa-check', 'fa-circle-check', 'fa-xmark', 
    'fa-circle-xmark', 'fa-info', 'fa-circle-info', 'fa-question', 'fa-circle-question',
    'fa-exclamation', 'fa-circle-exclamation', 'fa-triangle-exclamation', 'fa-sync', 
    'fa-rotate', 'fa-download', 'fa-upload', 'fa-cloud-arrow-up', 'fa-cloud-arrow-down', 
    'fa-file', 'fa-file-lines', 'fa-file-pdf', 'fa-file-word', 'fa-file-excel', 
    'fa-file-image', 'fa-image', 'fa-images', 'fa-camera', 'fa-video', 'fa-microphone', 
    'fa-music', 'fa-play', 'fa-pause', 'fa-stop', 'fa-forward', 'fa-backward', 
    'fa-phone', 'fa-mobile-screen', 'fa-tablet-screen-button', 'fa-laptop', 'fa-desktop',
    'fa-keyboard', 'fa-mouse', 'fa-print', 'fa-clock', 'fa-calendar', 'fa-calendar-days',
    'fa-map', 'fa-location-dot', 'fa-globe', 'fa-flag', 'fa-tag', 'fa-tags', 
    'fa-cart-shopping', 'fa-bag-shopping', 'fa-credit-card', 'fa-wallet', 'fa-money-bill', 
    'fa-chart-line', 'fa-chart-column', 'fa-chart-pie', 'fa-chart-area', 'fa-briefcase', 
    'fa-folder', 'fa-folder-open', 'fa-lock', 'fa-unlock', 'fa-key', 'fa-shield-halved',
    'fa-bolt', 'fa-lightbulb', 'fa-star', 'fa-heart', 'fa-heart-crack', 'fa-thumbs-up', 
    'fa-thumbs-down', 'fa-face-smile', 'fa-face-frown', 'fa-rocket', 'fa-paper-plane', 
    'fa-plane', 'fa-car', 'fa-bus', 'fa-truck', 'fa-bicycle', 'fa-anchor', 'fa-ship', 
    'fa-train', 'fa-cube', 'fa-cubes', 'fa-box', 'fa-boxes-stacked', 'fa-book', 
    'fa-book-open', 'fa-graduation-cap', 'fa-school', 'fa-building-columns', 
    'fa-hospital', 'fa-kit-medical', 'fa-eye', 'fa-glasses', 'fa-wheelchair'
  ];

  public filteredIcons: string[] = [];

  ngOnInit(): void {
    this.filteredIcons = [...this.allIcons];
  }

  filterIcons(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredIcons = this.allIcons.filter(icon => 
      icon.toLowerCase().includes(term) || 
      icon.toLowerCase().replace('fa-', '').includes(term)
    );
  }

  selectIcon(icon: string): void {
    if (this.onSelect) {
      this.onSelect(icon);
    }
    this.modalService.close();
  }

  close(): void {
    this.modalService.close();
  }
}
