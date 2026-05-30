import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  Transaction,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
  ],
  templateUrl: './transaction-dialog.html',
  styleUrl: './transaction-dialog.scss'
})
export class TransactionDialogComponent {

  dialogRef = inject(MatDialogRef<TransactionDialogComponent>);
  data      = inject<Transaction | null>(MAT_DIALOG_DATA);
  fb        = inject(FormBuilder);

  isEditing = !!this.data;

  incomeCategories  = INCOME_CATEGORIES;
  expenseCategories = EXPENSE_CATEGORIES;

  form = this.fb.group({
    type:        [this.data?.type        || 'expense', Validators.required],
    amount:      [this.data?.amount      || null,      [Validators.required, Validators.min(0.01)]],
    description: [this.data?.description || '',        Validators.required],
    category:    [this.data?.category    || null,      Validators.required],
    date:        [this.data?.date        || new Date(), Validators.required],
    note:        [this.data?.note        || ''],
  });

  get currentType() { return this.form.value.type; }

  get categories() {
    return this.currentType === 'income'
      ? this.incomeCategories
      : this.expenseCategories;
  }

  onTypeChange(): void {
    this.form.patchValue({ category: null });
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}