
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
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center">Recover Password</h1>
        <div *ngIf="!submitted; else successMessage">
          <p class="text-sm text-center text-gray-600">Enter your username and we'll send you an email with a new password.</p>
          <form [formGroup]="recoverForm" (ngSubmit)="onSubmit()" class="mt-6">
            <div class="space-y-4">
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                <input formControlName="username" id="username" type="text"
                       class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div *ngIf="errorMessage" class="mt-4 text-sm text-red-600">
              {{ errorMessage }}
            </div>
            <div class="mt-6">
              <button type="submit" [disabled]="recoverForm.invalid"
                      class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                Send Recovery Email
              </button>
            </div>
          </form>
        </div>
        <ng-template #successMessage>
          <div class="text-center">
            <h2 class="text-xl font-semibold">Email Sent</h2>
            <p class="mt-2 text-gray-600">If an account with that username exists, a new password has been sent to the registered email address.</p>
            <a routerLink="/login" class="inline-block mt-6 text-indigo-600 hover:underline">Back to Login</a>
          </div>
        </ng-template>
         <div class="text-sm text-center">
            <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Remembered your password?
            </a>
          </div>
      </div>
    </div>
  `,
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
