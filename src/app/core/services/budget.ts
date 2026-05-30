import { Injectable, signal, computed, inject } from '@angular/core';
import { Budget } from '../models/budget.model';
import { TransactionCategory } from '../models/transaction.model';
import { StorageService } from './storage';

const STORAGE_KEY = 'fintrack_budgets';

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private storage = inject(StorageService);
  private _budgets = signal<Budget[]>([]);

  readonly budgets = this._budgets.asReadonly();

  constructor() {
    this._budgets.set(this.loadFromStorage());
  }

  add(data: Omit<Budget, 'id' | 'createdAt'>): Budget {
    const budget: Budget = {
      ...data,
      id:        crypto.randomUUID(),
      createdAt: new Date(),
    };
    this._budgets.update(b => [...b, budget]);
    this.persist();
    return budget;
  }

  update(id: string, changes: Partial<Budget>): void {
    this._budgets.update(bs =>
      bs.map(b => b.id === id ? { ...b, ...changes } : b)
    );
    this.persist();
  }

  delete(id: string): void {
    this._budgets.update(bs => bs.filter(b => b.id !== id));
    this.persist();
  }

  getByMonth(year: number, month: number): Budget[] {
    return this._budgets().filter(b =>
      b.year === year && b.month === month
    );
  }

  private persist(): void {
    this.storage.set(STORAGE_KEY, this._budgets());
  }

  private loadFromStorage(): Budget[] {
    const saved = this.storage.get<Budget[]>(STORAGE_KEY);
    return (saved || []).map(b => ({
      ...b,
      createdAt: new Date(b.createdAt),
    }));
  }
}