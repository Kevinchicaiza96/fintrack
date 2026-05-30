import { Component, inject, computed, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../core/services/transaction';
import { TransactionDialogComponent } from '../transactions/transaction-dialog/transaction-dialog';
import { ToastService } from '../../core/services/toast';
import { getCategoryLabel, getCategoryIcon } from '../../core/models/transaction.model';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop-pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyCopPipe, DatePipe, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  transactionService = inject(TransactionService);
  dialog             = inject(MatDialog);
  toast              = inject(ToastService);

  today = new Date();
  chart: Chart | null = null;

  recentTransactions = computed(() =>
    this.transactionService.transactions().slice(0, 6)
  );

  savingsRate = computed(() => {
    const income = this.transactionService.monthlyIncome();
    if (income === 0) return 0;
    return Math.round(((income - this.transactionService.monthlyExpenses()) / income) * 100);
  });

  getCategoryLabel = getCategoryLabel;
  getCategoryIcon  = getCategoryIcon;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  buildChart(): void {
    const data = this.transactionService.getLast6MonthsData();

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: 'Ingresos',
            data: data.map(d => d.income),
            backgroundColor: 'rgba(5,150,105,0.15)',
            borderColor: '#059669',
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: 'Gastos',
            data: data.map(d => d.expenses),
            backgroundColor: 'rgba(220,38,38,0.10)',
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
              label: ctx => ` $${(ctx.parsed.y ?? 0).toLocaleString('es-CO')}`
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

  openNewTransaction(): void {
    const ref = this.dialog.open(TransactionDialogComponent, {
      width: '500px',
      panelClass: 'fintrack-dialog'
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.transactionService.add(result);
      this.toast.success('Transacción agregada');
      this.chart?.destroy();
      setTimeout(() => this.buildChart(), 100);
    });
  }
}