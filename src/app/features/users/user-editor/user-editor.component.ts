
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { GroupService } from '../../../core/services/group.service';
import { CreateUserRequest, UpdateUserRequest, User } from '../../../core/models/user.model';
import { Group } from '../../../core/models/group.model';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.css']
})
export class UserEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private groupService = inject(GroupService);

  editorForm!: FormGroup;
  isEditMode = false;
  private userId: string | null = null;
  allGroups: Group[] = [];
  allRoles: string[] = ['admin', 'user', 'sender']; // Example roles

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    this.groupService.getGroups().pipe(
      switchMap(groups => {
        this.allGroups = groups;
        this.buildGroupControls();

        const user$ = this.isEditMode ? this.userService.getUser(this.userId!) : of(null);
        return forkJoin({ groups: of(groups), user: user$ });
      })
    ).subscribe(({ user }) => {
      if (this.isEditMode && user) {
        this.editorForm.patchValue({
          username: user.username,
          email: user.email,
          enabled: user.enabled
        });

        const rolesControls = this.editorForm.get('roles') as FormGroup;
        this.allRoles.forEach(role => {
          rolesControls.get(role)?.setValue(user.roles.includes(role));
        });

        const groupControls = this.editorForm.get('groups') as FormGroup;
        this.allGroups.forEach(group => {
          groupControls.get(group.id)?.setValue(user.groupIds.includes(group.id));
        });

        this.editorForm.get('username')?.disable();
      }
    });
  }

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: this.fb.group({}),
      groups: this.fb.group({}),
      enabled: [true]
    });
  }

  private buildGroupControls(): void {
    const groupControls = this.editorForm.get('groups') as FormGroup;
    this.allGroups.forEach(group => {
      groupControls.addControl(group.id, this.fb.control(false));
    });

    const roleControls = this.editorForm.get('roles') as FormGroup;
    this.allRoles.forEach(role => {
      roleControls.addControl(role, this.fb.control(false));
    });
  }

  private getSelectedIds(formGroup: FormGroup): string[] {
    return Object.keys(formGroup.value).filter(key => formGroup.value[key]);
  }

  onSubmit(): void {
    if (this.editorForm.invalid) {
      return;
    }

    const formValue = this.editorForm.getRawValue();
    const selectedGroupIds = this.getSelectedIds(this.editorForm.get('groups') as FormGroup);
    const selectedRoles = this.getSelectedIds(this.editorForm.get('roles') as FormGroup);

    const request: CreateUserRequest | UpdateUserRequest = {
      email: formValue.email,
      roles: selectedRoles,
      groupIds: selectedGroupIds,
      ...(this.isEditMode ? { enabled: formValue.enabled } : { username: formValue.username })
    };

    const saveOperation = this.isEditMode
      ? this.userService.updateUser(this.userId!, request as UpdateUserRequest)
      : this.userService.createUser(request as CreateUserRequest);

    saveOperation.subscribe(() => {
      this.router.navigate(['/users']);
    });
  }
}
