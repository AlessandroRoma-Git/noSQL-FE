
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-editor',
  standalone: true,
  imports: [CommonModule, ColorPickerModule],
  templateUrl: './theme-editor.component.html',
  styleUrls: ['./theme-editor.component.css']
})
export class ThemeEditorComponent implements OnInit {
  private themeService = inject(ThemeService);

  // Default colors for the palettes
  palettes = {
    coder: { primary: '#73ef69', accent: '#db2777', text: '#73ef69', bgBase: '#000000', bgSurface: '#111827' },
    light: { primary: '#4f46e5', accent: '#db2777', text: '#1f2937', bgBase: '#f3f4f6', bgSurface: '#ffffff' },
    dark: { primary: '#818cf8', accent: '#f472b6', text: '#e5e7eb', bgBase: '#111827', bgSurface: '#1f2937' },
  };

  // Live colors bound to the color pickers
  liveColors: any = {};

  ngOnInit(): void {
    this.loadCurrentColors();
  }

  loadCurrentColors(): void {
    const rootStyle = getComputedStyle(document.documentElement);
    this.liveColors = {
      primary: this.rgbToHex(rootStyle.getPropertyValue('--color-primary')),
      accent: this.rgbToHex(rootStyle.getPropertyValue('--color-accent')),
      text: this.rgbToHex(rootStyle.getPropertyValue('--color-text')),
      bgBase: this.rgbToHex(rootStyle.getPropertyValue('--color-bg-base')),
      bgSurface: this.rgbToHex(rootStyle.getPropertyValue('--color-bg-surface')),
    };
  }

  applyPalette(paletteName: 'coder' | 'light' | 'dark'): void {
    this.liveColors = { ...this.palettes[paletteName] };
    this.applyColors();
  }

  applyColors(): void {
    this.themeService.setLiveColors(this.liveColors);
  }

  saveTheme(): void {
    this.themeService.saveCustomTheme(this.liveColors);
    alert('Theme saved!'); // We will replace this with a proper notification
  }

  // Helper to convert 'r, g, b' string to hex
  private rgbToHex(rgb: string): string {
    const [r, g, b] = rgb.split(',').map(Number);
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  }
}
