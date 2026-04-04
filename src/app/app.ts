import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from 'app/common/components/modal/modal.component';
import { ToastComponent } from 'app/common/components/toast/toast.component';

/**
 * @class App
 * @description
 * Questa è la "casa" di tutto il sito. Ora è solo un guscio (shell) minimale.
 * La logica del layout è stata spostata nei componenti AdminLayout e ConsumerLayout.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
}
