import { Component, inject, OnInit, OnDestroy, TemplateRef, Type, ViewContainerRef, ViewChild } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ModalService, ModalState, ModalData } from '../../../core/services/modal.service';
import { Subscription } from 'rxjs';

/**
 * @class ModalComponent
 * @description
 * Questa è la "Scatola dei Popup" del sito. 
 * Può contenere messaggi semplici, domande di conferma o intere pagine (componenti).
 * Rimane nascosta finché il ModalService non le dice di aprirsi.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnInit, OnDestroy {
  // Strumento per gestire l'apertura e chiusura
  private modalService = inject(ModalService);
  
  // Riferimento al punto dove iniettiamo i componenti dinamici
  @ViewChild('componentHost', { read: ViewContainerRef, static: true }) componentHost!: ViewContainerRef;

  private subscription?: Subscription;

  // Lo stato attuale del popup (aperto/chiuso, cosa contiene)
  public state: ModalState | null = null;

  // Metodi per capire cosa mostrare nel template HTML senza errori di tipo
  get contentAsComponent(): Type<any> | null {
    return this.state?.contentType === 'component' ? (this.state.content as Type<any>) : null;
  }

  get contentAsTemplate(): TemplateRef<any> | null {
    return this.state?.contentType === 'template' ? (this.state.content as TemplateRef<any>) : null;
  }

  get contentAsData(): ModalData | null {
    return this.state?.contentType === 'data' ? (this.state.content as ModalData) : null;
  }

  ngOnInit() {
    // Ci mettiamo in ascolto del "telecomando" (ModalService)
    this.subscription = this.modalService.modalState$.subscribe(state => {
      this.state = state;
    });
  }

  ngOnDestroy() {
    // Quando distruggiamo il popup, smettiamo di ascoltare per non sprecare memoria
    this.subscription?.unsubscribe();
  }

  /**
   * Chiude il popup confermando l'azione (clic su OK/Sì)
   */
  confirm(): void {
    this.modalService.respond(true);
  }

  /**
   * Chiude il popup annullando l'azione (clic su Annulla/No)
   */
  cancel(): void {
    this.modalService.respond(false);
  }

  /**
   * Chiude il popup se clicchi fuori dalla finestrella (sullo sfondo scuro)
   */
  onContainerClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.modalService.close();
    }
  }
}
