import { Routes } from '@angular/router';
import { authGuard } from 'app/common/guards/auth.guard';
import { roleGuard } from 'app/common/guards/role.guard';
import { publicGuard } from 'app/common/guards/public.guard';

/**
 * @description
 * Abbiamo implementato il Lazy Loading! 
 * Invece di caricare tutto il sito all'inizio, Angular caricherà solo i pezzi
 * che l'utente sta effettivamente guardando. Questo rende l'avvio fulmineo.
 */
export const routes: Routes = [
  // Public routes (Auth)
  {
    path: 'login',
    loadComponent: () => import('app/consumer-app/features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'recover-password',
    loadComponent: () => import('app/consumer-app/features/auth/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent),
    canActivate: [publicGuard]
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('app/consumer-app/features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'files', 
        loadComponent: () => import('app/consumer-app/features/files/file-list.component').then(m => m.FileListComponent) 
      },
      { 
        path: 'change-password', 
        loadComponent: () => import('app/consumer-app/features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent) 
      },
      {
        path: 'records/:entityKey',
        children: [
          { 
            path: '', 
            loadComponent: () => import('app/consumer-app/features/records/admin-view/record-list.component').then(m => m.RecordListComponent) 
          },
          { 
            path: 'new', 
            loadComponent: () => import('app/consumer-app/features/records/admin-view/record-editor.component').then(m => m.RecordEditorComponent) 
          },
          { 
            path: 'edit/:id', 
            loadComponent: () => import('app/consumer-app/features/records/admin-view/record-editor.component').then(m => m.RecordEditorComponent) 
          }
        ]
      },

      // Admin Routes (Configurator)
      {
        path: 'settings',
        loadComponent: () => import('app/configurator/features/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'entity-definitions',
        canActivate: [roleGuard],
        children: [
          { 
            path: '', 
            loadComponent: () => import('app/configurator/features/entity-definitions/entity-definition-list/entity-definition-list.component').then(m => m.EntityDefinitionListComponent) 
          },
          { 
            path: 'new', 
            loadComponent: () => import('app/configurator/features/entity-definitions/entity-definition-editor/entity-definition-editor.component').then(m => m.EntityDefinitionEditorComponent) 
          },
          { 
            path: 'edit/:key', 
            loadComponent: () => import('app/configurator/features/entity-definitions/entity-definition-editor/entity-definition-editor.component').then(m => m.EntityDefinitionEditorComponent) 
          }
        ]
      },
      {
        path: 'email-templates',
        canActivate: [roleGuard],
        children: [
          { 
            path: '', 
            loadComponent: () => import('app/configurator/features/email-templates/email-template-list/email-template-list.component').then(m => m.EmailTemplateListComponent) 
          },
          { 
            path: 'new', 
            loadComponent: () => import('app/configurator/features/email-templates/email-template-editor/email-template-editor.component').then(m => m.EmailTemplateEditorComponent) 
          },
          { 
            path: 'edit/:id', 
            loadComponent: () => import('app/configurator/features/email-templates/email-template-editor/email-template-editor.component').then(m => m.EmailTemplateEditorComponent) 
          }
        ]
      },
      {
        path: 'groups',
        canActivate: [roleGuard],
        children: [
          { 
            path: '', 
            loadComponent: () => import('app/configurator/features/groups/group-list/group-list.component').then(m => m.GroupListComponent) 
          },
          { 
            path: 'new', 
            loadComponent: () => import('app/configurator/features/groups/group-editor/group-editor.component').then(m => m.GroupEditorComponent) 
          },
          { 
            path: 'edit/:id', 
            loadComponent: () => import('app/configurator/features/groups/group-editor/group-editor.component').then(m => m.GroupEditorComponent) 
          }
        ]
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        children: [
          { 
            path: '', 
            loadComponent: () => import('app/configurator/features/users/user-list/user-list.component').then(m => m.UserListComponent) 
          },
          { 
            path: 'new', 
            loadComponent: () => import('app/configurator/features/users/user-editor/user-editor.component').then(m => m.UserEditorComponent) 
          },
          { 
            path: 'edit/:id', 
            loadComponent: () => import('app/configurator/features/users/user-editor/user-editor.component').then(m => m.UserEditorComponent) 
          }
        ]
      },
      {
        path: 'menu',
        canActivate: [roleGuard],
        children: [
          { 
            path: '', 
            loadComponent: () => import('app/configurator/features/menu/menu-list/menu-list.component').then(m => m.MenuListComponent) 
          },
          { 
            path: 'new', 
            loadComponent: () => import('app/configurator/features/menu/menu-editor/menu-editor.component').then(m => m.MenuEditorComponent) 
          },
          { 
            path: 'edit/:id', 
            loadComponent: () => import('app/configurator/features/menu/menu-editor/menu-editor.component').then(m => m.MenuEditorComponent) 
          }
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
