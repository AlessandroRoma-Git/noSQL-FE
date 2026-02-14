
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.css']
})
export class ToggleSwitchComponent {
  @Input() option1 = 'UI';
  @Input() option2 = 'JSON';
  @Input() activeOption: string = this.option1;
  @Output() toggleChange = new EventEmitter<string>();

  toggle(): void {
    this.activeOption = this.activeOption === this.option1 ? this.option2 : this.option1;
    this.toggleChange.emit(this.activeOption);
  }
}
