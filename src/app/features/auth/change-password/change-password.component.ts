
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordRequest } from '../../../core/models/auth.model';

// Custom validator to check that two fields match
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

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center">Change Password</h1>
        <p class="text-sm text-center text-gray-600">This is your first login. Please set a new password to continue.</p>
        <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="oldPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
              <input formControlName="oldPassword" id="oldPassword" type="password"
                     class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
              <input formControlName="newPassword" id="newPassword" type="password"
                     class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input formControlName="confirmPassword" id="confirmPassword" type="password"
                     class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <div *ngIf="changePasswordForm.get('confirmPassword')?.hasError('passwordMismatch')" class="text-xs text-red-600 mt-1">
                Passwords do not match.
              </div>
            </div>
          </div>
          <div *ngIf="errorMessage" class="mt-4 text-sm text-red-600">
            {{ errorMessage }}
          </div>
          <div class="mt-6">
            <button type="submit" [disabled]="changePasswordForm.invalid"
                    class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  changePasswordForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.changePasswordForm = this.fb.group({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, {
      validators: passwordMatchValidator('newPassword', 'confirmPassword')
    });
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();
      const request: ChangePasswordRequest = { oldPassword, newPassword };

      this.authService.changePassword(request).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to change password. Please check your current password and try again.';
          console.error(err);
        }
      });
    }
  }
}
