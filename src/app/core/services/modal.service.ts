
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ModalData } from '../models/modal.model';

interface ConfirmationModalData extends ModalData {
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private display = new BehaviorSubject<boolean>(false);
  private data = new BehaviorSubject<ConfirmationModalData | null>(null);
  private confirmationResult = new Subject<boolean>();

  get display$(): Observable<boolean> {
    return this.display.asObservable();
  }

  get data$(): Observable<ConfirmationModalData | null> {
    return this.data.asObservable();
  }

  open(data: ModalData): void {
    this.data.next({ ...data, confirmText: undefined, cancelText: undefined });
    this.display.next(true);
  }

  confirm(title: string, content: string, confirmText = 'Confirm', cancelText = 'Cancel'): Observable<boolean> {
    this.data.next({ title, content, confirmText, cancelText });
    this.display.next(true);

    // Reset the subject for the new confirmation
    this.confirmationResult = new Subject<boolean>();
    return this.confirmationResult.asObservable();
  }

  respond(result: boolean): void {
    this.confirmationResult.next(result);
    this.confirmationResult.complete();
    this.close();
  }

  close(): void {
    this.display.next(false);
    this.data.next(null);
    // If a confirmation is pending, closing it is considered a "false"
    if (!this.confirmationResult.closed) {
      this.confirmationResult.next(false);
      this.confirmationResult.complete();
    }
  }
}
