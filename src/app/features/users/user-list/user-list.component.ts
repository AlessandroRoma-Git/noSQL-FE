
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { ModalService } from '../../../core/services/modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  public users$!: Observable<User[]>;

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.userService.loadUsers().subscribe();
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
