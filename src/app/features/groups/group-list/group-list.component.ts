
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Group } from '../../../core/models/group.model';
import { GroupService } from '../../../core/services/group.service';
import { ModalService } from '../../../core/services/modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  private groupService = inject(GroupService);
  private modalService = inject(ModalService);
  public groups$!: Observable<Group[]>;

  ngOnInit(): void {
    this.groups$ = this.groupService.groups$;
    this.groupService.loadGroups().subscribe();
  }

  onDelete(id: string, name: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete the group <strong>${name}</strong>?`
    ).pipe(
      filter(confirmed => confirmed)
    ).subscribe(() => {
      this.groupService.deleteGroup(id).subscribe();
    });
  }
}
