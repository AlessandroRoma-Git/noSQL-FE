
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { CreateGroupRequest, UpdateGroupRequest } from '../../../core/models/group.model';

@Component({
  selector: 'app-group-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './group-editor.component.html',
})
export class GroupEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupService);

  editorForm!: FormGroup;
  isEditMode = false;
  private groupId: string | null = null;
  public systemRoles = ['ADMIN', 'SUPER_ADMIN'];

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.groupId;
    this.initializeForm();

    if (this.isEditMode && this.groupId) {
      this.groupService.getGroup(this.groupId).subscribe(group => {
        this.editorForm.patchValue(group);
      });
    }
  }

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      systemRole: [null]
    });
  }

  onSubmit(): void {
    if (this.editorForm.invalid) {
      return;
    }

    const formValue = this.editorForm.getRawValue();
    const request: CreateGroupRequest | UpdateGroupRequest = {
      name: formValue.name,
      description: formValue.description,
      systemRole: formValue.systemRole || null
    };

    const saveOperation = this.isEditMode
      ? this.groupService.updateGroup(this.groupId!, request)
      : this.groupService.createGroup(request);

    saveOperation.subscribe(() => {
      this.router.navigate(['/groups']);
    });
  }
}
