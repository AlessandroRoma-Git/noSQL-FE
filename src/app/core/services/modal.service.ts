
import { Injectable, Type } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * @interface ModalData
 * @description Represents the data for a simple informational or confirmation modal.
 */
export interface ModalData {
  title: string;
  content: string;
}

/**
 * @type ModalContent
 * @description Represents the content that can be displayed in a modal.
 * It can be either a component `Type` for dynamic component rendering,
 * or a `ModalData` object for simple modals.
 */
export type ModalContent = Type<any> | ModalData;

/**
 * @interface ModalState
 * @description Represents the complete state of the modal at any given time.
 */
export interface ModalState {
  content: ModalContent | null;
  isConfirmation: boolean;
  isOpen: boolean;
}

/**
 * @class ModalService
 * @description A service to control the application's global modal.
 * It can open modals with dynamic components or simple data, and manage confirmation dialogs.
 */
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  /**
   * Observable stream of the modal's state. Components can subscribe to this
   * to react to modal changes.
   */
  public modalState$: Observable<ModalState>;

  private modalState = new BehaviorSubject<ModalState>({ content: null, isConfirmation: false, isOpen: false });
  private responseSubject = new Subject<boolean>();

  constructor() {
    this.modalState$ = this.modalState.asObservable();
  }

  /**
   * Opens the modal with the given content.
   * @param content - The content to display, either a component `Type` or `ModalData`.
   */
  open(content: ModalContent): void {
    this.modalState.next({ content, isConfirmation: false, isOpen: true });
  }

  /**
   * Opens a confirmation modal.
   * @param title - The title of the confirmation dialog.
   * @param content - The message/content of the confirmation dialog.
   * @returns An observable that emits `true` if the user confirms, or `false` if they cancel. It completes after the first emission.
   */
  confirm(title: string, content: string): Observable<boolean> {
    const data: ModalData = { title, content };
    this.modalState.next({ content: data, isConfirmation: true, isOpen: true });
    return this.responseSubject.asObservable().pipe(take(1));
  }

  /**
   * Sends a response from a confirmation modal and closes it.
   * @param response - The user's response (`true` for confirm, `false` for cancel).
   * @internal
   */
  respond(response: boolean): void {
    this.responseSubject.next(response);
    this.close();
  }

  /**
   * Closes the modal.
   */
  close(): void {
    this.modalState.next({ content: null, isConfirmation: false, isOpen: false });
  }
}
