import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login').then(m => m.LoginComponent) },
  // {
  //   path: '',
  //   loadComponent: () => import('./core/layout/app-shell/app-shell').then(m => m.AppShell),
  //   canActivate: [authGuard],
  //   children: [
  //     { path: 'security-admin/users', loadComponent: () => import('./features/security-admin/users/users-list/users-list').then(m => m.UsersList) },
  //     { path: 'security-admin/roles', loadComponent: () => import('./features/security-admin/roles/roles-list/roles-list').then(m => m.RolesList) },
  //     { path: '', redirectTo: 'security-admin/users', pathMatch: 'full' },
  //     { path: 'security-admin/pages', loadComponent: () => import('./features/security-admin/pages/pages-list/pages-list').then(m => m.PagesList) },
  //     { path: 'scm/purchase-orders', loadComponent: () => import('./features/scm/purchase-orders/po-list/po-list').then(m => m.PoList) },
  //     { path: 'scm/purchase-orders', loadComponent: () => import('./features/scm/purchase-orders/po-list/po-list').then(m => m.PoList) },
  //     { path: 'scm/purchase-orders/new', loadComponent: () => import('./features/scm/purchase-orders/po-create/po-create').then(m => m.PoCreate) },
  //     { path: 'scm/purchase-orders/:id', loadComponent: () => import('./features/scm/purchase-orders/po-detail/po-detail').then(m => m.PoDetail) },
  //   ]
  // },
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
  ]
},
  { path: '**', redirectTo: '/login' },
];