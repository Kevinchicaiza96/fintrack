import { Component, inject, computed } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { BudgetService } from '../../../core/services/budget';
import { TransactionService } from '../../../core/services/transaction';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop-pipe';
import { ToastService } from '../../../core/services/toast';
import { BudgetDialogComponent } from '../budget-dialog/budget-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { Budget } from '../../../core/models/budget.model';
import { getCategoryLabel, getCategoryIcon } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [
    CurrencyCopPipe,
    TitleCasePipe,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.scss'
})
export class BudgetListComponent {

  budgetService      = inject(BudgetService);
  transactionService = inject(TransactionService);
  dialog             = inject(MatDialog);
  toast              = inject(ToastService);

  today = new Date();

  currentMonth = this.today.getMonth();
  currentYear  = this.today.getFullYear();

  monthName = this.today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  budgets = computed(() =>
    this.budgetService.getByMonth(this.currentYear, this.currentMonth)
  );

  getSpent(budget: Budget): number {
    return this.transactionService
      .getExpensesByCategory(budget.year, budget.month)[budget.category] || 0;
  }

  getPercent(budget: Budget): number {
    const spent = this.getSpent(budget);
    if (budget.limit === 0) return 0;
    return Math.min(Math.round((spent / budget.limit) * 100), 100);
  }

  getStatus(budget: Budget): 'safe' | 'warning' | 'danger' {
    const p = this.getPercent(budget);
    if (p >= 100) return 'danger';
    if (p >= 80)  return 'warning';
    return 'safe';
  }

  getCategoryLabel = getCategoryLabel;
  getCategoryIcon  = getCategoryIcon;

  openDialog(budget?: Budget): void {
    const ref = this.dialog.open(BudgetDialogComponent, {
      width: '460px',
      data: budget || null,
      panelClass: 'fintrack-dialog'
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (budget) {
        this.budgetService.update(budget.id, result);
        this.toast.success('Presupuesto actualizado');
      } else {
        this.budgetService.add(result);
        this.toast.success('Presupuesto creado');
      }
    });
  }

  deleteBudget(id: string, category: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title:   '¿Eliminar presupuesto?',
        message: `El presupuesto de "${getCategoryLabel(category as any)}" será eliminado.`,
        confirm: 'Eliminar',
        type:    'danger'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.budgetService.delete(id);
        this.toast.success('Presupuesto eliminado');
      }
    });
  }
}