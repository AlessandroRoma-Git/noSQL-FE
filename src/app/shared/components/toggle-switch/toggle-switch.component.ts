
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-switch.component.html',
})
export class ToggleSwitchComponent {
  @Input() activeOption: 'UI' | 'JSON' = 'UI';
  @Output() toggleChange = new EventEmitter<'UI' | 'JSON'>();

  toggle(): void {
    this.activeOption = this.activeOption === 'UI' ? 'JSON' : 'UI';
    this.toggleChange.emit(this.activeOption);
  }
}
