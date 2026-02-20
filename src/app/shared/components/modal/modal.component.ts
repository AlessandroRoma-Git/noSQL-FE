
import { Component, inject, ViewChild, ViewContainerRef, OnDestroy, OnInit, TemplateRef, Type, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalState, ModalData, ModalContent } from '../../../core/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnInit, OnDestroy {
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  @ViewChild('content', { read: ViewContainerRef, static: true }) private contentContainer!: ViewContainerRef;

  private subscription?: Subscription;

  public state: ModalState | null = null;

  // Type-safe getters
  get contentAsComponent(): Type<any> | null {
    return (typeof this.state?.content === 'function') ? this.state.content : null;
  }

  get contentAsTemplate(): TemplateRef<any> | null {
    return (this.state?.content instanceof TemplateRef) ? this.state.content : null;
  }

  get contentAsData(): ModalData | null {
    const content = this.state?.content;
    return (!!content && typeof content !== 'function' && !(content instanceof TemplateRef)) ? content : null;
  }

  ngOnInit() {
    this.subscription = this.modalService.modalState$.subscribe(state => {
      this.state = state;
      this.contentContainer.clear();

      if (state.isOpen && this.contentAsComponent) {
        const componentRef = this.contentContainer.createComponent(this.contentAsComponent);
        if (state.data) {
          Object.assign(componentRef.instance, state.data);
        }
        // Manually trigger change detection for the dynamic component
        componentRef.changeDetectorRef.detectChanges();
      }

      // Manually trigger change detection for the modal component itself
      this.cdr.detectChanges();
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
