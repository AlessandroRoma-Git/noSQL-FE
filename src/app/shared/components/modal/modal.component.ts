
import { Component, inject, OnInit, OnDestroy, TemplateRef, Type, ViewContainerRef, ViewChild } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ModalService, ModalState, ModalData, ModalContent } from '../../../core/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnInit, OnDestroy {
  private modalService = inject(ModalService);
  @ViewChild('componentHost', { read: ViewContainerRef, static: true }) componentHost!: ViewContainerRef;

  private subscription?: Subscription;

  public state: ModalState | null = null;

  // Type-safe getters for the template
  get contentAsComponent(): Type<any> | null {
    return this.state?.contentType === 'component' ? this.state.content as Type<any> : null;
  }

  get contentAsTemplate(): TemplateRef<any> | null {
    return this.state?.contentType === 'template' ? this.state.content as TemplateRef<any> : null;
  }

  get contentAsData(): ModalData | null {
    return this.state?.contentType === 'data' ? this.state.content as ModalData : null;
  }

  ngOnInit() {
    this.subscription = this.modalService.modalState$.subscribe(state => {
      this.state = state;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  confirm(): void {
    this.modalService.respond(true);
  }

  cancel(): void {
    this.modalService.respond(false);
  }

  onContainerClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.modalService.close();
    }
  }
}
