import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalContent, ModalState, ModalData } from '../../../core/services/modal.service';
import { I18nService } from '../../../core/services/i18n.service';

/**
 * @class ModalComponent
 * @description
 * Un contenitore "galleggiante" universale.
 * Può mostrare semplici messaggi, moduli interi o caricare altri componenti.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  private modalService = inject(ModalService);
  public i18nService = inject(I18nService);

  public state: ModalState | null = null;

  constructor() {
    this.modalService.modalState$.subscribe(state => {
      this.state = state;
    });
  }

  get contentAsComponent() {
    return this.state?.contentType === 'component' ? this.state.content as any : null;
  }

  get contentAsTemplate() {
    return this.state?.contentType === 'template' ? this.state.content as any : null;
  }

  get contentAsData() {
    return this.state?.contentType === 'data' ? this.state.content as ModalData : null;
  }

  confirm(): void {
    this.modalService.respond(true);
  }

  cancel(): void {
    this.modalService.respond(false);
  }

  onContainerClick(event: MouseEvent): void {
    // Se clicchiamo sullo sfondo scuro, chiudiamo il modale
    if (event.target === event.currentTarget) {
      this.modalService.close();
    }
  }
}
