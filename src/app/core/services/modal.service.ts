
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModalData } from '../models/modal.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private display = new BehaviorSubject<boolean>(false);
  private data = new BehaviorSubject<ModalData | null>(null);

  get display$(): Observable<boolean> {
    return this.display.asObservable();
  }

  get data$(): Observable<ModalData | null> {
    return this.data.asObservable();
  }

  open(data: ModalData): void {
    this.data.next(data);
    this.display.next(true);
  }

  close(): void {
    this.display.next(false);
    this.data.next(null);
  }
}
