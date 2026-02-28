import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { UserService } from 'app/configurator/services/user.service';
import { DashboardService, DashboardStat } from 'app/consumer-app/services/dashboard.service';
import { User } from 'app/configurator/models/user.model';
import { EntityDefinition } from 'app/configurator/models/entity-definition.model';
import { I18nService } from 'app/common/services/i18n.service';
import { ModalService } from 'app/common/services/modal.service';

/**
 * @class DashboardComponent
 * @description
 * Questa è la "Home Page" del tuo CMS. 
 * Qui puoi vedere un riassunto di tutto quello che succede nel sistema.
 * È configurabile: puoi scegliere quali tabelle tenere d'occhio (es. quanti Clienti, quanti Ordini).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  // --- STRUMENTI ---
  private entityService = inject(EntityDefinitionService);
  private userService = inject(UserService);
  private dashboardService = inject(DashboardService);
  public i18nService = inject(I18nService);
  private modalService = inject(ModalService);

  // --- DATI DINAMICI ---
  public allEntities$!: Observable<EntityDefinition[]>; // Tutte le tabelle disponibili
  public dashboardStats$!: Observable<DashboardStat[]>; // Le statistiche numeriche (totali)
  public recentUsers$!: Observable<User[]>; // Gli ultimi 5 utenti creati
  
  // --- STATO ---
  public isConfiguring = false; // Siamo in modalità "Scelta tabelle"?
  public selectedKeys: string[] = []; // Quali tabelle ha scelto l'utente?

  /**
   * Appena entri nella Dashboard...
   */
  ngOnInit(): void {
    // 1. Prendiamo l'elenco di tutte le tabelle (Entity)
    this.allEntities$ = this.entityService.definitions$;
    this.entityService.loadEntityDefinitions().subscribe();

    // 2. Prendiamo gli ultimi utenti
    this.userService.loadUsers().subscribe();
    this.recentUsers$ = this.userService.users$.pipe(
      map(users => users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5))
    );

    // 3. Prepariamo le "Figurine" numeriche basandoci sulla scelta dell'utente
    this.refreshStats();

    // 4. Leggiamo la configurazione attuale per il pannello di scelta
    this.dashboardService.config$.subscribe(keys => {
      this.selectedKeys = [...keys];
    });
  }

  /**
   * Aggiorna i numeri dei totali sulla pagina.
   */
  refreshStats(): void {
    this.dashboardStats$ = this.allEntities$.pipe(
      switchMap(entities => {
        const entityList = entities.map(e => ({ key: e.entityKey, label: e.label }));
        return this.dashboardService.getDashboardStats(entityList);
      })
    );
  }

  /**
   * Questo metodo apre una finestrella (Modal) che spiega all'utente
   * cosa deve fare in questa pagina. È utilissimo per chi non ha mai usato un CMS!
   */
  showHelp(): void {
    const info = this.i18nService.translate('HELP.DASHBOARD');
    this.modalService.openInfo('Guida Rapida: Dashboard', info);
  }

  /**
   * Entra o esce dalla modalità di scelta delle tabelle.
   */
  toggleConfig(): void {
    this.isConfiguring = !this.isConfiguring;
  }

  /**
   * Aggiunge o toglie una tabella dalla dashboard quando ci clicchi sopra.
   */
  onEntityToggle(key: string): void {
    if (this.selectedKeys.includes(key)) {
      this.selectedKeys = this.selectedKeys.filter(k => k !== key);
    } else {
      // Massimo 4 tabelle per non affollare la pagina
      if (this.selectedKeys.length < 4) {
        this.selectedKeys.push(key);
      }
    }
  }

  /**
   * Salva la scelta dell'utente e aggiorna i numeri.
   */
  saveConfig(): void {
    this.dashboardService.saveConfig(this.selectedKeys);
    this.isConfiguring = false;
    this.refreshStats();
  }
}
