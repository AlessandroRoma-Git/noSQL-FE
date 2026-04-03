import { Routes } from '@angular/router';
import { authGuard } from 'app/common/guards/auth.guard';
import { roleGuard } from 'app/common/guards/role.guard';
import { publicGuard } from 'app/common/guards/public.guard';

export const routes: Routes = [
  // Public routes (Auth)
  {
    path: 'login',
    loadComponent: () => import('app/common/features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'recover-password',
    loadComponent: () => import('app/common/features/auth/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent),
    canActivate: [publicGuard]
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // Password change (mandatory if firstAccess)
      {
        path: 'change-password',
        loadComponent: () => import('app/common/features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      },

      // CONFIGURATOR (ADMIN / SUPER_ADMIN)
      {
        path: 'configurator',
        canActivate: [roleGuard],
        loadComponent: () => import('app/common/components/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('app/configurator/features/settings/settings.component').then(m => m.SettingsComponent) // Temporary placeholder
          },
          {
            path: 'settings',
            loadComponent: () => import('app/configurator/features/settings/settings.component').then(m => m.SettingsComponent)
          },
          {
            path: 'entity-definitions',
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
            path: 'files',
            loadComponent: () => import('app/configurator/features/settings/settings.component').then(m => m.SettingsComponent) // Placeholder
          },
          {
            path: 'records/:entityKey',
            loadComponent: () => import('app/configurator/features/settings/settings.component').then(m => m.SettingsComponent) // Placeholder
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      },

      // CONSUMER APP (ALL AUTHENTICATED USERS)
      {
        path: 'consumer-app',
        loadComponent: () => import('app/common/components/layout/consumer-layout/consumer-layout.component').then(m => m.ConsumerLayoutComponent),
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('app/common/features/auth/login/login.component').then(m => m.LoginComponent) // Temporary placeholder
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      },

      // Default redirect after login based on role
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'configurator'
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: 'login'
  }
];
