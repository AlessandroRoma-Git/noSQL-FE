import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { WhiteLabelService, WhiteLabelConfig } from '../../../core/services/white-label.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Observable } from 'rxjs';

/**
 * @class LoginComponent
 * @description
 * Questa è la pagina dove gli utenti "bussano alla porta" per entrare.
 * Chiede nome utente e password e controlla se sono giusti.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // --- STRUMENTI ---
  private fb = inject(FormBuilder); // Serve per creare il modulo (form) del login
  private authService = inject(AuthService); // Serve per inviare i dati al server
  private whiteLabelService = inject(WhiteLabelService); // Serve per sapere il nome del sito e il logo
  public i18nService = inject(I18nService); // Serve per tradurre i testi della pagina

  // --- DATI ---
  public config$!: Observable<WhiteLabelConfig>; // Qui salviamo le info sulla "marca" (logo, nome)

  // Il nostro modulo dove l'utente scrive nome e password
  loginForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
  }>;

  errorMessage: string | null = null; // Messaggio che appare se sbagli la password

  constructor() {
    // Prepariamo i campi del login (vuoti e obbligatori)
    this.loginForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Quando la pagina si carica, iniziamo a "ascoltare" la configurazione del brand.
   */
  ngOnInit() {
    this.config$ = this.whiteLabelService.config$;
  }

  /**
   * Questo metodo viene eseguito quando clicchi sul bottone "Login".
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      // Prendiamo quello che l'utente ha scritto
      const credentials = this.loginForm.getRawValue() as LoginRequest;
      
      // Proviamo a entrare
      this.authService.login(credentials).subscribe({
        error: (err) => {
          // Se il server dice di no, mostriamo un errore (potrebbe essere tradotto pure questo!)
          this.errorMessage = 'Credenziali non valide. Riprova.';
          console.error(err);
        }
        // Se va bene, il servizio ci sposterà automaticamente nella Dashboard
      });
    }
  }
}
