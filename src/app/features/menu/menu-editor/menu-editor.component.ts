
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { GroupService } from '../../../core/services/group.service';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { CreateMenuItemRequest, UpdateMenuItemRequest } from '../../../core/models/menu-item.model';
import { Group } from '../../../core/models/group.model';
import { EntityDefinition } from '../../../core/models/entity-definition.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-menu-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.css']
})
export class MenuEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private menuService = inject(MenuService);
  private groupService = inject(GroupService);
  private entityDefService = inject(EntityDefinitionService);

  editorForm!: FormGroup;
  isEditMode = false;
  private menuItemId: string | null = null;

  allGroups: Group[] = [];
  allEntities: EntityDefinition[] = [];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.menuItemId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.menuItemId;

    const groups$ = this.groupService.getGroups();
    const entities$ = this.entityDefService.getEntityDefinitions();
    // We don't load the menu item here, as we need the groups and entities first to build the form

    forkJoin({ groups: groups$, entities: entities$ }).subscribe(({ groups, entities }) => {
      this.allGroups = groups;
      this.allEntities = entities;
      this.buildGroupControls();

      if (this.isEditMode && this.menuItemId) {
        // Now load the menu item and patch the form
        // this.menuService.getMenuItem(this.menuItemId).subscribe(menuItem => {
        //   this.editorForm.patchValue(menuItem);
        //   // patch group checkboxes
        // });
      }
    });
  }

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      label: ['', Validators.required],
      entityKey: [''],
      icon: [''],
      position: [0, Validators.required],
      groups: this.fb.group({}) // Built dynamically
    });
  }

  private buildGroupControls(): void {
    const groupControls = this.editorForm.get('groups') as FormGroup;
    this.allGroups.forEach(group => {
      groupControls.addControl(group.name, this.fb.control(false));
    });
  }

  private getSelectedGroups(): string[] {
    const groupControls = this.editorForm.get('groups') as FormGroup;
    return Object.keys(groupControls.value).filter(key => groupControls.value[key]);
  }

  onSubmit(): void {
    if (this.editorForm.invalid) {
      return;
    }

    const formValue = this.editorForm.getRawValue();
    const selectedGroups = this.getSelectedGroups();

    const request: CreateMenuItemRequest | UpdateMenuItemRequest = {
      label: formValue.label,
      entityKey: formValue.entityKey || undefined,
      icon: formValue.icon || undefined,
      position: formValue.position,
      groups: selectedGroups.length > 0 ? selectedGroups : undefined
    };

    const saveOperation = this.isEditMode
      ? this.menuService.updateMenuItem(this.menuItemId!, request)
      : this.menuService.createMenuItem(request);

    saveOperation.subscribe(() => {
      this.router.navigate(['/menu']);
    });
  }
}
