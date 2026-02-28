import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RecoverPasswordRequest } from '../../../core/models/auth.model';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public i18nService = inject(I18nService);

  recoverForm: FormGroup;
  errorMessage: string | null = null;
  submitted = false;

  constructor() {
    this.recoverForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.recoverForm.valid) {
      const request: RecoverPasswordRequest = this.recoverForm.getRawValue();
      this.authService.recoverPassword(request).subscribe({
        next: () => {
          this.submitted = true;
          this.errorMessage = null;
        },
        error: (err) => {
          this.submitted = true;
          console.error(err);
        }
      });
    }
  }
}
