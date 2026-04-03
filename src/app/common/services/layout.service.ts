import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WhiteLabelService } from './white-label.service';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private whiteLabelService = inject(WhiteLabelService);
  
  private isSidebarOpenSubject = new BehaviorSubject<boolean>(true);
  public isSidebarOpen$ = this.isSidebarOpenSubject.asObservable();

  constructor() {
    this.whiteLabelService.config$.subscribe(config => {
      if (config.layoutMode !== 'sidebar' && config.layoutMode !== 'bottom-nav') {
        this.isSidebarOpenSubject.next(false);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpenSubject.next(!this.isSidebarOpenSubject.value);
  }

  setSidebarOpen(isOpen: boolean): void {
    this.isSidebarOpenSubject.next(isOpen);
  }

  get isSidebarOpen(): boolean {
    return this.isSidebarOpenSubject.value;
  }
}
