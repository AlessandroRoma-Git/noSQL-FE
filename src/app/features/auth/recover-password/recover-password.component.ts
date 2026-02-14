
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RecoverPasswordRequest } from '../../../core/models/auth.model';
import { RouterLink } from '@angular/router';

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
          // For security, we show the same success message even if the user is not found.
          // The error is only logged for debugging.
          this.submitted = true;
          console.error(err);
        }
      });
    }
  }
}
