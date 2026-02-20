
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MenuService } from '../../../core/services/menu.service';
import { GroupService } from '../../../core/services/group.service';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { Group } from '../../../core/models/group.model';
import { EntityDefinition } from '../../../core/models/entity-definition.model';
import { MenuItem } from '../../../core/models/menu-item.model';

@Component({
  selector: 'app-menu-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './menu-editor.component.html',
})
export class MenuEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private menuService = inject(MenuService);
  private groupService = inject(GroupService);
  private entityDefService = inject(EntityDefinitionService);

  public editorForm!: FormGroup;
  public isEditMode = false;
  private itemId: string | null = null;

  public allGroups: Group[] = [];
  public allEntities: EntityDefinition[] = [];
  public allMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.itemId;
    this.initForm();
    this.loadDependencies();
  }

  private initForm(): void {
    this.editorForm = this.fb.group({
      label: ['', Validators.required],
      entityKey: [''],
      icon: [''],
      position: [0, Validators.required],
      parentId: [null],
      groups: this.fb.group({})
    });
  }

  private loadDependencies(): void {
    forkJoin({
      groups: this.groupService.loadGroups(),
      entities: this.entityDefService.loadEntityDefinitions(),
      menuItems: this.menuService.loadMenuItems()
    }).subscribe(({ groups, entities, menuItems }) => {
      this.allGroups = groups;
      this.allEntities = entities;
      this.allMenuItems = menuItems;

      const groupControls = this.editorForm.get('groups') as FormGroup;
      groups.forEach(group => {
        groupControls.addControl(group.name, this.fb.control(false));
      });

      if (this.isEditMode && this.itemId) {
        this.menuService.getMenuItem(this.itemId).subscribe((item: MenuItem) => {
          this.editorForm.patchValue(item);
          groupControls.patchValue(
            this.allGroups.reduce((acc, group) => {
              acc[group.name] = item.groups?.includes(group.name) || false;
              return acc;
            }, {} as Record<string, boolean>)
          );
        });
      }
    });
  }

  onSubmit(): void {
    if (this.editorForm.invalid) return;

    const formValue = this.editorForm.value;
    const selectedGroups = Object.keys(formValue.groups).filter(key => formValue.groups[key]);
    const payload = { ...formValue, groups: selectedGroups, parentId: formValue.parentId || null };

    const operation = this.isEditMode && this.itemId
      ? this.menuService.updateMenuItem(this.itemId, payload)
      : this.menuService.createMenuItem(payload);

    operation.subscribe(() => this.router.navigate(['/menu']));
  }
}
