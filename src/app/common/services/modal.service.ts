
import { Injectable, Type, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ModalData {
  title: string;
  content: string;
}

export type ModalContent = Type<any> | TemplateRef<any> | ModalData;

export interface ModalState {
  isOpen: boolean;
  contentType: 'component' | 'template' | 'data' | null;
  content: ModalContent | null;
  data?: any; // For component inputs
  isConfirmation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalState = new BehaviorSubject<ModalState>({ isOpen: false, contentType: null, content: null, isConfirmation: false });
  public modalState$: Observable<ModalState> = this.modalState.asObservable();

  private responseSubject = new Subject<boolean>();

  openComponent<T>(component: Type<T>, data?: any): void {
    this.modalState.next({
      isOpen: true,
      contentType: 'component',
      content: component,
      data: data,
      isConfirmation: false
    });
  }

  openTemplate(template: TemplateRef<any>): void {
    this.modalState.next({
      isOpen: true,
      contentType: 'template',
      content: template,
      isConfirmation: false
    });
  }

  openInfo(title: string, content: string): void {
    this.modalState.next({
      isOpen: true,
      contentType: 'data',
      content: { title, content },
      isConfirmation: false
    });
  }

  confirm(title: string, content: string): Observable<boolean> {
    this.modalState.next({
      isOpen: true,
      contentType: 'data',
      content: { title, content },
      isConfirmation: true
    });
    return this.responseSubject.asObservable().pipe(take(1));
  }

  respond(response: boolean): void {
    this.responseSubject.next(response);
    this.close();
  }

  close(): void {
    this.modalState.next({ isOpen: false, contentType: null, content: null, isConfirmation: false });
  }
}
