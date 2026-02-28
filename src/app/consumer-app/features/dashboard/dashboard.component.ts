import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map, switchMap, of, forkJoin } from 'rxjs';
import { EntityDefinitionService } from 'app/configurator/services/entity-definition.service';
import { UserService } from 'app/configurator/services/user.service';
import { DashboardService, DashboardStat } from 'app/consumer-app/services/dashboard.service';
import { User } from 'app/configurator/models/user.model';
import { EntityDefinition } from 'app/configurator/models/entity-definition.model';
import { I18nService } from 'app/common/services/i18n.service';
import { ModalService } from 'app/common/services/modal.service';
import { AuthService } from 'app/common/services/auth.service';
import { MenuService } from 'app/configurator/services/menu.service';
import { MenuItem } from 'app/common/models/menu-item.model';

/**
 * @class DashboardComponent
 * @description
 * Questa è la "Home Page". 
 * Se sei Admin, vedi tutto e puoi gestire gli utenti.
 * Se sei un Utente normale, vedi solo le tabelle che ti sono state assegnate nel menu.
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
  private menuService = inject(MenuService);
  private authService = inject(AuthService);
  public i18nService = inject(I18nService);
  private modalService = inject(ModalService);

  // --- DATI DINAMICI ---
  public isAdmin$!: Observable<boolean>;
  public accessibleEntities$!: Observable<{key: string, label: string}[]>; 
  public dashboardStats$!: Observable<DashboardStat[]>; 
  public recentUsers$!: Observable<User[]>; 
  
  // --- STATO ---
  public isConfiguring = false; 
  public selectedKeys: string[] = []; 

  ngOnInit(): void {
    // 1. Verifichiamo se l'utente è Admin
    this.isAdmin$ = this.authService.systemRoles$.pipe(
      map(roles => roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'))
    );

    // 2. Carichiamo le entità in base al ruolo
    // SE ADMIN -> Tutte le definizioni
    // SE USER -> Solo quelle nel suo menu (così non usiamo l'API proibita)
    this.accessibleEntities$ = this.isAdmin$.pipe(
      switchMap(isAdmin => {
        if (isAdmin) {
          this.entityService.loadEntityDefinitions().subscribe();
          return this.entityService.definitions$.pipe(
            map(defs => defs.map(d => ({ key: d.entityKey, label: d.label })))
          );
        } else {
          return this.menuService.userMenuItems$.pipe(
            map(items => items.filter(i => !!i.entityKey).map(i => ({ key: i.entityKey!, label: i.label })))
          );
        }
      })
    );

    // 3. Se Admin, carichiamo gli ultimi utenti
    this.isAdmin$.subscribe(isAdmin => {
      if (isAdmin) {
        this.userService.loadUsers().subscribe();
        this.recentUsers$ = this.userService.users$.pipe(
          map(users => users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5))
        );
      } else {
        this.recentUsers$ = of([]);
      }
    });

    // 4. Prepariamo le "Figurine" numeriche
    this.refreshStats();

    // 5. Leggiamo la configurazione delle tabelle preferite
    this.dashboardService.config$.subscribe(keys => {
      this.selectedKeys = [...keys];
    });
  }

  refreshStats(): void {
    this.dashboardStats$ = this.accessibleEntities$.pipe(
      switchMap(entities => {
        return this.dashboardService.getDashboardStats(entities);
      })
    );
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.DASHBOARD');
    this.modalService.openInfo('Guida Rapida: Dashboard', info);
  }

  toggleConfig(): void {
    this.isConfiguring = !this.isConfiguring;
  }

  onEntityToggle(key: string): void {
    if (this.selectedKeys.includes(key)) {
      this.selectedKeys = this.selectedKeys.filter(k => k !== key);
    } else {
      if (this.selectedKeys.length < 4) {
        this.selectedKeys.push(key);
      }
    }
  }

  saveConfig(): void {
    this.dashboardService.saveConfig(this.selectedKeys);
    this.isConfiguring = false;
    this.refreshStats();
  }
}
