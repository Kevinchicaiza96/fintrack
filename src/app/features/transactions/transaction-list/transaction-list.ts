import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from '../../../core/services/export';
import { TransactionService } from '../../../core/services/transaction';
import { ToastService } from '../../../core/services/toast';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop-pipe';
import { Transaction, getCategoryLabel, getCategoryIcon } from '../../../core/models/transaction.model';

type FilterType = 'all' | 'income' | 'expense';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, CurrencyCopPipe, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss'
})
export class TransactionListComponent {

  exportService      = inject(ExportService);
  transactionService = inject(TransactionService);
  dialog             = inject(MatDialog);
  toast              = inject(ToastService);

  today         = new Date();
  activeFilter  = signal<FilterType>('all');
  selectedMonth = signal<number | null>(null);
  selectedYear  = signal<number | null>(null);
  searchQuery   = signal('');

  months = [
    { value: 0,  label: 'Enero' },
    { value: 1,  label: 'Febrero' },
    { value: 2,  label: 'Marzo' },
    { value: 3,  label: 'Abril' },
    { value: 4,  label: 'Mayo' },
    { value: 5,  label: 'Junio' },
    { value: 6,  label: 'Julio' },
    { value: 7,  label: 'Agosto' },
    { value: 8,  label: 'Septiembre' },
    { value: 9,  label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
  ];

  currentPeriodLabel = computed(() => {
    const m = this.selectedMonth();
    const y = this.selectedYear();
    if (m === null || y === null) return 'Todos los períodos';
    return new Date(y, m, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  filteredTransactions = computed(() => {
    let txs = this.transactionService.transactions();

    const m = this.selectedMonth();
    const y = this.selectedYear();
    if (m !== null && y !== null) {
      txs = txs.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y;
      });
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      txs = txs.filter(t =>
        t.description.toLowerCase().includes(q) ||
        getCategoryLabel(t.category).toLowerCase().includes(q) ||
        (t.note || '').toLowerCase().includes(q)
      );
    }

    const f = this.activeFilter();
    if (f !== 'all') txs = txs.filter(t => t.type === f);

    return txs;
  });

  periodIncome = computed(() =>
    this.filteredTransactions()
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
  );

  periodExpenses = computed(() =>
    this.filteredTransactions()
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
  );

  periodBalance = computed(() => this.periodIncome() - this.periodExpenses());

  getCategoryLabel = getCategoryLabel;
  getCategoryIcon  = getCategoryIcon;

  selectPeriod(month: number, year: number): void {
    this.selectedMonth.set(month);
    this.selectedYear.set(year);
  }

  clearPeriod(): void {
    this.selectedMonth.set(null);
    this.selectedYear.set(null);
  }

  setSearch(q: string): void {
    this.searchQuery.set(q);
  }

  openDialog(transaction?: Transaction): void {
    const ref = this.dialog.open(TransactionDialogComponent, {
      width: '500px',
      data: transaction || null,
      panelClass: 'fintrack-dialog'
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (transaction) {
        this.transactionService.update(transaction.id, result);
        this.toast.success('Transacción actualizada');
      } else {
        this.transactionService.add(result);
        this.toast.success('Transacción agregada');
      }
    });
  }

  deleteTransaction(id: string, description: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title:   '¿Eliminar transacción?',
        message: `"${description}" será eliminada permanentemente.`,
        confirm: 'Eliminar',
        type:    'danger'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.transactionService.delete(id);
        this.toast.success('Transacción eliminada');
      }
    });
  }

  exportCsv(): void {
    const txs = this.filteredTransactions();
    if (txs.length === 0) {
      this.toast.warning('No hay transacciones para exportar');
      return;
    }
    this.exportService.exportTransactionsToExcel(txs, 'fintrack-transacciones');
    this.toast.success(`${txs.length} transacciones exportadas`);
  }

  setFilter(f: FilterType): void {
    this.activeFilter.set(f);
  }

  getAvailableYears(): number[] {
    const years = new Set(
      this.transactionService.transactions()
        .map(t => new Date(t.date).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }
}