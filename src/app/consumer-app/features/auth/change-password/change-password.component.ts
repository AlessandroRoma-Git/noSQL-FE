import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/common/services/auth.service';
import { ChangePasswordRequest } from 'app/common/models/auth.model';
import { I18nService } from 'app/common/services/i18n.service';
import { ToastService } from 'app/common/services/toast.service';

/**
 * Validatore personalizzato per controllare che le due password scritte siano identiche.
 */
export function passwordMatchValidator(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup): ValidationErrors | null => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      return null;
    }
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

/**
 * @class ChangePasswordComponent
 * @description
 * Questa è la "Stanza di Sicurezza".
 * Se l'utente entra per la prima volta, lo obblighiamo a passare di qui.
 * Non può vedere nient'altro del sito finché non sceglie una nuova password sicura.
 */
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  // --- STRUMENTI ---
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public i18nService = inject(I18nService);
  private toastService = inject(ToastService);

  // Il modulo per cambiare password
  public changePasswordForm: FormGroup;
  public errorMessage: string | null = null;

  constructor() {
    // Prepariamo i campi: vecchia password, nuova e conferma
    this.changePasswordForm = this.fb.group({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, {
      // Usiamo il nostro controllo speciale per vedere se le psw coincidono
      validators: passwordMatchValidator('newPassword', 'confirmPassword')
    });
  }

  /**
   * Eseguito quando l'utente preme il tastone di aggiornamento.
   */
  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();
      const request: ChangePasswordRequest = { oldPassword, newPassword };

      // Chiamiamo il server per cambiare la password
      this.authService.changePassword(request).subscribe({
        next: () => {
          // Successo! Ora l'utente può finalmente entrare nel sito vero e proprio
          this.toastService.success(this.i18nService.translate('CHANGE_PASSWORD.SUCCESS'));
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = 'Errore: controlla che la password attuale sia corretta.';
          console.error(err);
        }
      });
    }
  }
}
