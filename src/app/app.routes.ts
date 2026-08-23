import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./core/layout/app-shell/app-shell').then(m => m.AppShell),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/home/home/home').then(m => m.Home) },
      { path: 'security-admin/users', loadComponent: () => import('./features/security-admin/users/users-list/users-list').then(m => m.UsersList) },
      { path: 'security-admin/roles', loadComponent: () => import('./features/security-admin/roles/roles-list/roles-list').then(m => m.RolesList) },
      { path: 'security-admin/pages', loadComponent: () => import('./features/security-admin/pages/pages-list/pages-list').then(m => m.PagesList) },
      { path: 'scm/purchase-orders', loadComponent: () => import('./features/scm/purchase-orders/po-list/po-list').then(m => m.PoList) },
      { path: 'scm/purchase-orders/new', loadComponent: () => import('./features/scm/purchase-orders/po-create/po-create').then(m => m.PoCreate) },
      { path: 'scm/purchase-orders/:id', loadComponent: () => import('./features/scm/purchase-orders/po-detail/po-detail').then(m => m.PoDetail) },
      { path: 'scm/items', loadComponent: () => import('./features/scm/items/item-list/item-list').then(m => m.ItemList) },
      { path: 'scm/suppliers', loadComponent: () => import('./features/scm/suppliers/supplier-list/supplier-list').then(m => m.SupplierList) },
      { path: 'workflow/inbox', loadComponent: () => import('./features/workflow/inbox/inbox/inbox').then(m => m.Inbox) },
      { path: 'workflow/delegations', loadComponent: () => import('./features/workflow/delegations/delegation-list/delegation-list').then(m => m.DelegationList) },
      { path: 'workflow/definitions/quick-setup', loadComponent: () => import('./features/workflow/quick-setup/quick-setup/quick-setup').then(m => m.QuickSetup) },
      { path: 'workflow/definitions/new', loadComponent: () => import('./features/workflow/designer/designer/designer').then(m => m.Designer) },
      { path: 'workflow/definitions/:id/edit-manual', loadComponent: () => import('./features/workflow/quick-setup/quick-setup/quick-setup').then(m => m.QuickSetup) },
      { path: 'workflow/definitions/:id/edit', loadComponent: () => import('./features/workflow/designer/designer/designer').then(m => m.Designer) },
      { path: 'workflow/definitions/:id', loadComponent: () => import('./features/workflow/definitions/definition-detail/definition-detail').then(m => m.DefinitionDetail) },
      { path: 'workflow/definitions', loadComponent: () => import('./features/workflow/definitions/definition-list/definition-list').then(m => m.DefinitionList) },
    ]
  },
  { path: '**', redirectTo: '/login' },
];