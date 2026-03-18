import { Routes } from '@angular/router';
import { authGuard } from 'app/common/guards/auth.guard';
import { roleGuard } from 'app/common/guards/role.guard';
import { publicGuard } from 'app/common/guards/public.guard';

/**
 * @description
 * Configurazione principale delle rotte.
 * Gestisce l'accesso differenziato tra SuperAdmin e Utenti Consumer.
 */
export const routes: Routes = [
  // 1. ROTTE PUBBLICHE
  {
    path: 'login',
    loadComponent: () => import('app/consumer-app/features/omnium/pages/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },

  // 2. ROTTE PROTETTE
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // AREA CONSUMER (Omnium)
      {
        path: 'app',
        loadChildren: () => import('app/consumer-app/features/omnium/omnium.routes').then(m => m.routes)
      },

      // AREA ADMIN (Configuratore)
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        loadComponent: () => import('app/consumer-app/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        loadComponent: () => import('app/configurator/features/settings/settings.component').then(m => m.SettingsComponent)
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
        path: 'change-password',
        loadComponent: () => import('app/consumer-app/features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      },
      
      // Root Redirect
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'app'
      }
    ]
  },

  // 3. FALLBACK
  {
    path: '**',
    redirectTo: 'app'
  }
];
