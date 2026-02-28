
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user-editor.component.html',
})
export class UserEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private groupService = inject(GroupService);

  public editorForm!: FormGroup;
  public isEditMode = false;
  private userId: string | null = null;

  public allGroups: Group[] = [];

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;
    this.initForm();
    this.loadDependencies();
  }

  private initForm(): void {
    this.editorForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      enabled: [true],
      groups: this.fb.group({})
    });
  }

  private loadDependencies(): void {
    this.groupService.loadGroups().pipe(
      tap((groups: Group[]) => {
        this.allGroups = groups;
        const groupControls = this.editorForm.get('groups') as FormGroup;
        groups.forEach((group: Group) => groupControls.addControl(group.id, this.fb.control(false)));
      }),
      switchMap(() => {
        if (this.isEditMode && this.userId) {
          return this.userService.getUser(this.userId);
        }
        return of(null);
      })
    ).subscribe((user: User | null) => {
      if (user) {
        this.editorForm.patchValue(user);
        const groupControls = this.editorForm.get('groups') as FormGroup;
        groupControls.patchValue(
          this.allGroups.reduce((acc, group) => {
            acc[group.id] = user.groupIds?.includes(group.id) || false;
            return acc;
          }, {} as Record<string, boolean>)
        );
      }
    });
  }

  onSubmit(): void {
    if (this.editorForm.invalid) return;

    const formValue = this.editorForm.value;
    const selectedGroups = Object.keys(formValue.groups).filter(key => formValue.groups[key]);
    const payload = { ...formValue, groupIds: selectedGroups };

    const operation = this.isEditMode && this.userId
      ? this.userService.updateUser(this.userId, payload)
      : this.userService.createUser(payload);

    operation.subscribe(() => this.router.navigate(['/users']));
  }
}
