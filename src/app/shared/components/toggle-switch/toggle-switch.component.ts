import { Component, Input, Output, EventEmitter, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService } from '../../../core/services/i18n.service';

/**
 * @class ToggleSwitchComponent
 * @description
 * Un interruttore versatile che può funzionare in due modi:
 * 1. Come un semplice Sì/No (Boolean) per i moduli (Reactive Forms).
 * 2. Come un selettore tra due opzioni personalizzate (es. UI vs JSON).
 */
@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-switch.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSwitchComponent),
      multi: true
    }
  ]
})
export class ToggleSwitchComponent implements ControlValueAccessor {
  public i18nService = inject(I18nService);

  // --- MODALITÀ OPZIONI PERSONALIZZATE ---
  @Input() options: { value: any, label: string }[] = [];
  @Input() activeOption: any = null;
  @Output() toggleChange = new EventEmitter<any>();

  // --- STATO INTERNO (PER BOOLEAN / FORMS) ---
  public value = false;
  public disabled = false;
  public isBooleanMode = true;

  private onChange = (_value: any) => {};
  private onTouched = () => {};

  /**
   * Chiamato quando l'utente clicca sull'interruttore.
   */
  toggle(): void {
    if (this.disabled) return;

    if (this.options.length === 2) {
      // Modalità Scelta tra due opzioni
      this.activeOption = this.activeOption === this.options[0].value ? this.options[1].value : this.options[0].value;
      this.toggleChange.emit(this.activeOption);
      this.onChange(this.activeOption);
    } else {
      // Modalità standard (Sì/No)
      this.value = !this.value;
      this.onChange(this.value);
    }
    this.onTouched();
  }

  // --- METODI PER ANGULAR FORMS ---

  writeValue(val: any): void {
    if (this.options.length === 2) {
      this.activeOption = val;
      this.isBooleanMode = false;
    } else {
      this.value = !!val;
      this.isBooleanMode = true;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
