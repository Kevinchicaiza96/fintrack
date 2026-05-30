import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop-pipe';
import { TransactionService } from '../../core/services/transaction';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CurrencyCopPipe, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class TopbarComponent {
  transactionService = inject(TransactionService);
  today = new Date();

  navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'grid_view',              route: '/dashboard' },
    { label: 'Transacciones', icon: 'receipt_long',           route: '/transactions' },
    { label: 'Presupuestos',  icon: 'account_balance_wallet', route: '/budgets' },
    { label: 'Reportes',      icon: 'bar_chart',              route: '/reports' },
  ];

  balance = computed(() => this.transactionService.balance());
}