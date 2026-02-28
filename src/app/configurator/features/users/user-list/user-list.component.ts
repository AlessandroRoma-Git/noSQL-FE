import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'app/configurator/models/user.model';
import { UserService } from 'app/configurator/services/user.service';
import { ModalService } from 'app/common/services/modal.service';
import { I18nService } from 'app/common/services/i18n.service';
import { filter } from 'rxjs/operators';
import { FilterCondition, FilterOperator } from 'app/consumer-app/services/filter.service';
import { FormsModule } from '@angular/forms';

/**
 * @class UserListComponent
 * @description Gestione utenti con Query Builder integrato.
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  public i18nService = inject(I18nService);
  private destroy$ = new Subject<void>();

  public allUsers: User[] = [];
  public filteredUsers: User[] = [];

  // --- QUERY BUILDER ---
  public showFilters = false;
  public filterRows: FilterCondition[] = [];
  public availableOperators: { label: string, value: FilterOperator }[] = [
    { label: 'Uguale', value: 'eq' },
    { label: 'Contiene', value: 'like' }
  ];
  public columns = [
    { name: 'username', label: 'Username' },
    { name: 'email', label: 'Email' }
  ];

  ngOnInit(): void {
    this.userService.users$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(users => {
      this.allUsers = users;
      this.applyLocalFilters();
    });

    this.userService.loadUsers().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyLocalFilters(): void {
    if (this.filterRows.length === 0) {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(user => {
        return this.filterRows.every(row => {
          if (!row.field || row.value === '') return true;
          const userValue = String((user as any)[row.field]).toLowerCase();
          const filterValue = String(row.value).toLowerCase();

          if (row.op === 'eq') return userValue === filterValue;
          if (row.op === 'like') return userValue.includes(filterValue);
          return true;
        });
      });
    }
    this.cdr.detectChanges();
  }

  addFilterRow(): void {
    this.filterRows.push({ field: 'username', op: 'like', value: '' });
    this.showFilters = true;
  }

  removeFilterRow(index: number): void {
    this.filterRows.splice(index, 1);
    this.applyLocalFilters();
  }

  showHelp(): void {
    const info = this.i18nService.translate('HELP.USERS');
    this.modalService.openInfo('Guida Rapida: Utenti', info);
  }

  onDelete(id: string, username: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete the user <strong>${username}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.userService.deleteUser(id).subscribe();
    });
  }

  onResetPassword(id: string, username: string): void {
    this.modalService.confirm(
      'Confirm Password Reset',
      `Are you sure you want to reset the password for <strong>${username}</strong>? A new password will be sent via email.`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.userService.resetPassword(id).subscribe(() => {
        this.modalService.openInfo('Success', 'Password has been reset and sent to the user.');
      });
    });
  }
}
