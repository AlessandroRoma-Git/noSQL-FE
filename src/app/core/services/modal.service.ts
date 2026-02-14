
import { Injectable, Type } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

// Exporting interfaces so other components can use them
export interface ModalData {
  title: string;
  content: string;
}

export type ModalContent = Type<any> | ModalData;

export interface ModalState {
  content: ModalContent | null;
  isConfirmation: boolean;
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // Exposing the state as a public observable
  public modalState$: Observable<ModalState>;

  private modalState = new BehaviorSubject<ModalState>({ content: null, isConfirmation: false, isOpen: false });
  private responseSubject = new Subject<boolean>();

  constructor() {
    this.modalState$ = this.modalState.asObservable();
  }

  open(content: ModalContent): void {
    this.modalState.next({ content, isConfirmation: false, isOpen: true });
  }

  confirm(title: string, content: string): Observable<boolean> {
    const data: ModalData = { title, content };
    this.modalState.next({ content: data, isConfirmation: true, isOpen: true });
    return this.responseSubject.asObservable().pipe(take(1));
  }

  respond(response: boolean): void {
    this.responseSubject.next(response);
    this.close();
  }

  close(): void {
    this.modalState.next({ content: null, isConfirmation: false, isOpen: false });
  }
}
