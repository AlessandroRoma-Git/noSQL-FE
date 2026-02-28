import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { ModalService } from '../../../core/services/modal.service';
import { I18nService } from '../../../core/services/i18n.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  public i18nService = inject(I18nService);
  private destroy$ = new Subject<void>();

  public users: User[] = [];

  ngOnInit(): void {
    this.userService.users$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(users => {
      this.users = users;
    });

    this.userService.loadUsers().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Questo metodo apre una finestrella (Modal) che spiega all'utente
   * cosa deve fare in questa pagina.
   */
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
