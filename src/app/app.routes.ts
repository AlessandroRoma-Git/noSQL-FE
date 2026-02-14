
import { Routes } from '@angular/router';
import { EntityDefinitionListComponent } from './features/entity-definitions/entity-definition-list/entity-definition-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { RecoverPasswordComponent } from './features/auth/recover-password/recover-password.component';
import { EntityDefinitionEditorComponent } from './features/entity-definitions/entity-definition-editor/entity-definition-editor.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'recover-password',
    component: RecoverPasswordComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [authGuard]
  },
  {
    path: 'entity-definitions',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: EntityDefinitionListComponent
      },
      {
        path: 'new',
        component: EntityDefinitionEditorComponent
      },
      {
        path: 'edit/:key',
        component: EntityDefinitionEditorComponent
      }
    ]
  },

  {
    path: '',
    redirectTo: '/entity-definitions',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/entity-definitions'
  }
];
