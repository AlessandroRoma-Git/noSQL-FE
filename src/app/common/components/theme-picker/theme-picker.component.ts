
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from 'app/common/services/theme.service';

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.css']
})
export class ThemePickerComponent {
  private themeService = inject(ThemeService);

  themes = [
    { name: 'Coder', id: 'theme-coder' },
    { name: 'Light', id: 'theme-light' },
    { name: 'Dark', id: 'theme-dark' },
  ];

  setTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }
}
