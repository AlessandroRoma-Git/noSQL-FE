
import { Component, inject, ViewChild, ViewContainerRef, ComponentRef, Type, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalState, ModalData } from '../../../core/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  modalService = inject(ModalService);
  @ViewChild('content', { read: ViewContainerRef, static: true }) content!: ViewContainerRef;

  private componentRef?: ComponentRef<any>;
  private subscription?: Subscription;

  public state?: ModalState;
  public isComponent = false;
  public data?: ModalData;

  ngOnInit() {
    this.subscription = this.modalService.modalState$.subscribe(state => {
      this.state = state;

      // If the modal is closing, clear the content.
      if (!state.isOpen) {
        this.clearContent();
        return;
      }

      // If the modal is opening, set the new content.
      if (state.content) {
        const content = state.content;
        if (typeof content === 'function') {
          this.isComponent = true;
          this.data = undefined;
          // Defer component loading until the view container is ready.
          setTimeout(() => this.loadComponent(content), 0);
        } else {
          this.isComponent = false;
          this.data = content;
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadComponent(component: Type<any>) {
    if (!this.content) return;
    this.content.clear(); // Clear previous component before loading new one
    this.componentRef = this.content.createComponent(component);
  }

  clearContent() {
    if (this.content) {
      this.content.clear();
    }
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    this.data = undefined;
    this.isComponent = false;
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
