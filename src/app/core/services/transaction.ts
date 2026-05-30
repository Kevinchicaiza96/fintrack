import { Injectable, signal, computed, inject } from '@angular/core';
import { Transaction, TransactionCategory } from '../models/transaction.model';
import { StorageService } from './storage';

const STORAGE_KEY = 'fintrack_transactions';

@Injectable({ providedIn: 'root' })
export class TransactionService {

  private storage = inject(StorageService);
  private _transactions = signal<Transaction[]>([]);

  readonly transactions   = this._transactions.asReadonly();

  readonly totalIncome = computed(() =>
    this._transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly totalExpenses = computed(() =>
    this._transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly balance = computed(() =>
    this.totalIncome() - this.totalExpenses()
  );

  readonly monthlyIncome = computed(() => {
    const now = new Date();
    return this._transactions()
      .filter(t => t.type === 'income' &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0);
  });

  readonly monthlyExpenses = computed(() => {
    const now = new Date();
    return this._transactions()
      .filter(t => t.type === 'expense' &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0);
  });

  readonly monthlyBalance = computed(() =>
    this.monthlyIncome() - this.monthlyExpenses()
  );

  constructor() {
    this._transactions.set(this.loadFromStorage());
  }

  add(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transaction: Transaction = {
      ...data,
      id:        crypto.randomUUID(),
      createdAt: new Date(),
    };
    this._transactions.update(t => [transaction, ...t]);
    this.persist();
    return transaction;
  }

  update(id: string, changes: Partial<Transaction>): void {
    this._transactions.update(ts =>
      ts.map(t => t.id === id ? { ...t, ...changes } : t)
    );
    this.persist();
  }

  delete(id: string): void {
    this._transactions.update(ts => ts.filter(t => t.id !== id));
    this.persist();
  }

  getByMonth(year: number, month: number): Transaction[] {
    return this._transactions().filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  getByCategory(category: TransactionCategory): Transaction[] {
    return this._transactions().filter(t => t.category === category);
  }

  getExpensesByCategory(year: number, month: number): Record<string, number> {
    const result: Record<string, number> = {};
    this.getByMonth(year, month)
      .filter(t => t.type === 'expense')
      .forEach(t => {
        result[t.category] = (result[t.category] || 0) + t.amount;
      });
    return result;
  }

  getLast6MonthsData(): { month: string; income: number; expenses: number }[] {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date  = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year  = date.getFullYear();
      const month = date.getMonth();
      const txs   = this.getByMonth(year, month);
      result.push({
        month:    date.toLocaleDateString('es-ES', { month: 'short' }),
        income:   txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }

  private persist(): void {
    this.storage.set(STORAGE_KEY, this._transactions());
  }

  private loadFromStorage(): Transaction[] {
    const saved = this.storage.get<Transaction[]>(STORAGE_KEY);
    return (saved || []).map(t => ({
      ...t,
      date:      new Date(t.date),
      createdAt: new Date(t.createdAt),
    }));
  }
}