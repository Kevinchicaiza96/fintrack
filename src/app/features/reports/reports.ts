import { Component, inject, signal, computed, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../core/services/transaction';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop-pipe';
import { getCategoryLabel, TransactionCategory } from '../../core/models/transaction.model';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CurrencyCopPipe, TitleCasePipe, MatIconModule, MatButtonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class ReportsComponent implements AfterViewInit, OnDestroy {

  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  transactionService = inject(TransactionService);

  today         = new Date();
  selectedYear  = signal(this.today.getFullYear());
  selectedMonth = signal(this.today.getMonth());

  barChart: Chart | null = null;
  pieChart: Chart | null = null;

  monthName = computed(() =>
    new Date(this.selectedYear(), this.selectedMonth(), 1)
      .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  );

  monthlyStats = computed(() => {
    const txs      = this.transactionService.getByMonth(this.selectedYear(), this.selectedMonth());
    const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, balance: income - expenses, count: txs.length };
  });

  topExpenses = computed(() => {
    const byCategory = this.transactionService
      .getExpensesByCategory(
        this.selectedYear(),
        this.selectedMonth()
      );

    return Object.entries(byCategory)
      .map(([category, amount]) => ({ 
        category: category as TransactionCategory,
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  });

  getCategoryLabel = getCategoryLabel;

  ngAfterViewInit(): void {
    this.buildBarChart();
    this.buildPieChart();
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.pieChart?.destroy();
  }

  buildBarChart(): void {
    const data = this.transactionService.getLast6MonthsData();

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: 'Ingresos',
            data: data.map(d => d.income),
            backgroundColor: 'rgba(5,150,105,0.12)',
            borderColor: '#059669',
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: 'Gastos',
            data: data.map(d => d.expenses),
            backgroundColor: 'rgba(220,38,38,0.08)',
            borderColor: '#DC2626',
            borderWidth: 2,
            borderRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: 'Inter', size: 12 },
              color: '#888',
              boxWidth: 12,
              boxHeight: 12,
              borderRadius: 3,
            }
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#111',
            bodyColor: '#888',
            borderColor: '#ebebeb',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: ctx => `$${(ctx.parsed.y ?? 0).toLocaleString('es-CO')}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'JetBrains Mono', size: 11 }, color: '#bbb' }
          },
          y: {
            grid: { color: '#f5f5f5' },
            ticks: {
              font: { family: 'JetBrains Mono', size: 11 },
              color: '#bbb',
              callback: val => `$${Number(val).toLocaleString('es-CO')}`
            }
          }
        }
      }
    });
  }

  buildPieChart(): void {
    const byCategory = this.transactionService
      .getExpensesByCategory(this.selectedYear(), this.selectedMonth());

    const entries = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    if (entries.length === 0) return;

    const colors = ['#7C3AED', '#DC2626', '#059669', '#D97706', '#2563EB', '#DB2777'];

    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: entries.map(([cat]) => getCategoryLabel(cat as any)),
        datasets: [{
          data: entries.map(([, amt]) => amt),
          backgroundColor: colors.map(c => c + '20'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { family: 'Inter', size: 12 },
              color: '#888',
              boxWidth: 10,
              boxHeight: 10,
              borderRadius: 3,
              padding: 12,
            }
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#111',
            bodyColor: '#888',
            borderColor: '#ebebeb',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: ctx => ` $${Number(ctx.parsed).toLocaleString('es-CO')}`
            }
          }
        }
      }
    });
  }

  prevMonth(): void {
    if (this.selectedMonth() === 0) {
      this.selectedMonth.set(11);
      this.selectedYear.update(y => y - 1);
    } else {
      this.selectedMonth.update(m => m - 1);
    }
    this.refreshCharts();
  }

  nextMonth(): void {
    if (this.selectedMonth() === 11) {
      this.selectedMonth.set(0);
      this.selectedYear.update(y => y + 1);
    } else {
      this.selectedMonth.update(m => m + 1);
    }
    this.refreshCharts();
  }

  refreshCharts(): void {
    this.pieChart?.destroy();
    setTimeout(() => this.buildPieChart(), 50);
  }
}