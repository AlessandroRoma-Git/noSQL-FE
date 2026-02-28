
import { Routes } from '@angular/router';
import { EntityDefinitionListComponent } from './features/entity-definitions/entity-definition-list/entity-definition-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { publicGuard } from './core/guards/public.guard';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { RecoverPasswordComponent } from './features/auth/recover-password/recover-password.component';
import { EntityDefinitionEditorComponent } from './features/entity-definitions/entity-definition-editor/entity-definition-editor.component';
import { EmailTemplateListComponent } from './features/email-templates/email-template-list/email-template-list.component';
import { EmailTemplateEditorComponent } from './features/email-templates/email-template-editor/email-template-editor.component';
import { GroupListComponent } from './features/groups/group-list/group-list.component';
import { GroupEditorComponent } from './features/groups/group-editor/group-editor.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserEditorComponent } from './features/users/user-editor/user-editor.component';
import { MenuListComponent } from './features/menu/menu-list/menu-list.component';
import { MenuEditorComponent } from './features/menu/menu-editor/menu-editor.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FileListComponent } from './features/files/file-list.component';
import { RecordListComponent } from './features/records/record-list.component';
import { RecordEditorComponent } from './features/records/record-editor.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'recover-password',
    component: RecoverPasswordComponent,
    canActivate: [publicGuard]
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'files', component: FileListComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      {
        path: 'records/:entityKey',
        children: [
          { path: '', component: RecordListComponent },
          { path: 'new', component: RecordEditorComponent },
          { path: 'edit/:id', component: RecordEditorComponent }
        ]
      },
      // Admin Routes
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [roleGuard]
      },
      {
        path: 'entity-definitions',
        canActivate: [roleGuard],
        children: [
          { path: '', component: EntityDefinitionListComponent },
          { path: 'new', component: EntityDefinitionEditorComponent },
          { path: 'edit/:key', component: EntityDefinitionEditorComponent }
        ]
      },
      {
        path: 'email-templates',
        canActivate: [roleGuard],
        children: [
          { path: '', component: EmailTemplateListComponent },
          { path: 'new', component: EmailTemplateEditorComponent },
          { path: 'edit/:id', component: EmailTemplateEditorComponent }
        ]
      },
      {
        path: 'groups',
        canActivate: [roleGuard],
        children: [
          { path: '', component: GroupListComponent },
          { path: 'new', component: GroupEditorComponent },
          { path: 'edit/:id', component: GroupEditorComponent }
        ]
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        children: [
          { path: '', component: UserListComponent },
          { path: 'new', component: UserEditorComponent },
          { path: 'edit/:id', component: UserEditorComponent }
        ]
      },
      {
        path: 'menu',
        canActivate: [roleGuard],
        children: [
          { path: '', component: MenuListComponent },
          { path: 'new', component: MenuEditorComponent },
          { path: 'edit/:id', component: MenuEditorComponent }
        ]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: ''
  }
];
