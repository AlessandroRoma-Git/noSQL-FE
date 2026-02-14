
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { Observable } from 'rxjs';
import { ModalData } from '../../../core/models/modal.model';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  modalService = inject(ModalService);
  display$: Observable<boolean>;
  data$: Observable<any>; // Use 'any' to handle both ModalData and ConfirmationModalData

  constructor() {
    this.display$ = this.modalService.display$;
    this.data$ = this.modalService.data$;
  }

  close(): void {
    this.modalService.close();
  }

  confirm(): void {
    this.modalService.respond(true);
  }

  cancel(): void {
    this.modalService.respond(false);
  }

  onContainerClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
