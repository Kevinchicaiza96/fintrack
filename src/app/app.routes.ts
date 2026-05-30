import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-list/transaction-list').then(m => m.TransactionListComponent)
      },
      {
        path: 'budgets',
        loadComponent: () =>
          import('./features/budgets/budget-list/budget-list').then(m => m.BudgetListComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports').then(m => m.ReportsComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];