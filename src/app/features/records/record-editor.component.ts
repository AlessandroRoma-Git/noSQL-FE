import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { EntityDefinitionService } from '../../core/services/entity-definition.service';
import { RecordService } from '../../core/services/record.service';
import { ToastService } from '../../core/services/toast.service';
import { EntityDefinition } from '../../core/models/entity-definition.model';
import { ReferenceSearchComponent } from '../../shared/components/reference-search/reference-search.component';
import { RecordHistoryComponent } from './record-history/record-history.component';

/**
 * @class RecordEditorComponent
 * @description
 * Questo componente è il "Modulo Intelligente" del nostro CMS.
 * Serve per creare o modificare i dati (i "Record") di qualsiasi entità (Clienti, Prodotti, ecc.).
 * È intelligente perché si adatta da solo: se un campo è obbligatorio o ha dei limiti,
 * il modulo lo sa e blocca l'utente se sbaglia a scrivere.
 */
@Component({
  selector: 'app-record-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ReferenceSearchComponent, RecordHistoryComponent],
  templateUrl: './record-editor.component.html',
})
export class RecordEditorComponent implements OnInit {
  // --- STRUMENTI ---
  private route = inject(ActivatedRoute); // Per sapere cosa c'è scritto nell'indirizzo (URL)
  private router = inject(Router); // Per cambiare pagina
  private fb = inject(FormBuilder); // Per costruire il modulo (form)
  private entityDefinitionService = inject(EntityDefinitionService); // Per scaricare lo "schema" (cosa dobbiamo mostrare?)
  private recordService = inject(RecordService); // Per salvare i dati
  private toastService = inject(ToastService); // Per mandare messaggi di successo o errore

  // --- STATO DEL MODULO ---
  public editorForm!: FormGroup; // Il contenitore di tutti i campi
  public entityDefinition!: EntityDefinition; // Le istruzioni su come è fatta questa tabella
  public isEditMode = false; // Stiamo creando (false) o modificando (true)?
  public entityKey!: string; // Il nome della tabella (es: 'customers')
  public recordId: string | null = null; // L'ID del record se stiamo modificando
  
  // Gestione delle schede (Tab)
  public activeTab: 'data' | 'history' = 'data';

  /**
   * Appena entriamo nella pagina...
   */
  ngOnInit(): void {
    // 1. Leggiamo dall'URL che entità stiamo gestendo e se c'è un ID
    this.entityKey = this.route.snapshot.paramMap.get('entityKey')!;
    this.recordId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recordId;

    // 2. Chiediamo al server: "Ehi, come è fatta l'entità 'customers'?"
    this.entityDefinitionService.getEntityDefinition(this.entityKey).subscribe(def => {
      this.entityDefinition = def;
      this.buildForm(); // Una volta saputo come è fatta, costruiamo il modulo
    });
  }

  /**
   * Costruisce il modulo (form) in base ai campi definiti nel database.
   * @description
   * Per ogni campo (es: Nome, Età, Email) creiamo un controllo nel modulo
   * e gli diamo le "regole" (es: deve essere un'email, non può essere vuoto).
   */
  private buildForm(): void {
    const formControls: { [key: string]: any } = {};

    this.entityDefinition.fields.forEach(field => {
      // Prepariamo la lista delle regole (Validator) per questo campo
      const validators: ValidatorFn[] = [];
      
      if (field.required) validators.push(Validators.required); // Non può essere vuoto
      if (field.type === 'EMAIL') validators.push(Validators.email); // Deve avere la @ e il punto
      
      // Limiti di lunghezza (es: max 100 lettere)
      if (field.maxLen) validators.push(Validators.maxLength(field.maxLen));
      
      // Limiti numerici (es: minimo 18 anni)
      if (field.min !== undefined) validators.push(Validators.min(field.min));
      if (field.max !== undefined) validators.push(Validators.max(field.max));
      
      // Regole speciali (Regex) come "solo lettere" o "formato codice fiscale"
      if (field.pattern) validators.push(Validators.pattern(field.pattern));

      // Valore di partenza (se è un riferimento a un'altra tabella, è una lista vuota)
      const initialValue = field.type === 'REFERENCE' ? [] : null;
      
      // Creiamo il controllo per il modulo
      formControls[field.name] = [initialValue, validators];
    });

    this.editorForm = this.fb.group(formControls);

    // Se siamo in modalità modifica, scarichiamo i dati dal server e riempiamo il modulo
    if (this.isEditMode && this.recordId) {
      this.recordService.getRecord(this.entityKey, this.recordId).subscribe(record => {
        this.editorForm.patchValue(record.data);
      });
    }
  }

  /**
   * Controlla se un campo ha un errore da mostrare.
   * Serve per colorare di rosso i campi sbagliati mentre scrivi.
   */
  public hasError(fieldName: string, errorType: string): boolean {
    const control = this.editorForm.get(fieldName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }

  /**
   * Cambia la scheda visualizzata (Dati o Storico).
   */
  public setTab(tab: 'data' | 'history'): void {
    this.activeTab = tab;
  }

  /**
   * Invia i dati al server quando clicchi "Salva".
   */
  onSubmit(): void {
    if (this.editorForm.invalid) {
      // Se ci sono errori, avvisiamo l'utente e non facciamo nulla
      this.toastService.error('Controlla i campi evidenziati in rosso.');
      this.editorForm.markAllAsTouched(); // Evidenzia tutti gli errori
      return;
    }

    // Prendiamo i dati dal modulo
    const request = { data: this.editorForm.value };
    
    // Decidiamo se chiamare l'API per "Crea" o quella per "Aggiorna"
    const operation = this.isEditMode && this.recordId
      ? this.recordService.updateRecord(this.entityKey, this.recordId, request)
      : this.recordService.createRecord(this.entityKey, request);

    operation.subscribe({
      next: () => {
        // Se tutto va bene, avvisiamo e torniamo alla lista
        this.toastService.success(this.isEditMode ? 'Record aggiornato!' : 'Record creato!');
        this.router.navigate(['/records', this.entityKey]);
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        // L'intercettore mostrerà già il toast dell'errore server
      }
    });
  }
}
