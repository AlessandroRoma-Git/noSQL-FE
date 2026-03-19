import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from 'app/common/services/auth.service';
import { LoginRequest } from 'app/common/models/auth.model';
import { WhiteLabelService, WhiteLabelConfig } from 'app/common/services/white-label.service';
import { I18nService } from 'app/common/services/i18n.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private whiteLabelService = inject(WhiteLabelService);
  public i18nService = inject(I18nService);

  public config$!: Observable<WhiteLabelConfig>;
  showStaffLogin = signal(false);

  loginForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
  }>;

  errorMessage: string | null = null;

  constructor() {
    this.loginForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.config$ = this.whiteLabelService.config$;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue() as LoginRequest;
      this.authService.login(credentials).subscribe({
        error: (err) => {
          this.errorMessage = 'Access Denied. Check credentials.';
          console.error(err);
        }
      });
    }
  }

  loginWithDiscord(): void {
    // Reindirizza all'endpoint del backend che gestisce Discord OAuth
    // Esempio: window.location.href = 'http://localhost:8088/api/v1/auth/discord';
    alert('Discord OAuth Integration: Redirecting to authorization server...');
  }
}
