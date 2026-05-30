import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Budget } from '../../../core/models/budget.model';
import { EXPENSE_CATEGORIES } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-budget-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './budget-dialog.html',
  styleUrl: './budget-dialog.scss'
})
export class BudgetDialogComponent {

  dialogRef = inject(MatDialogRef<BudgetDialogComponent>);
  data      = inject<Budget | null>(MAT_DIALOG_DATA);
  fb        = inject(FormBuilder);

  isEditing  = !!this.data;
  categories = EXPENSE_CATEGORIES;

  today = new Date();

  form = this.fb.group({
    category: [this.data?.category || null,        Validators.required],
    limit:    [this.data?.limit    || null,        [Validators.required, Validators.min(1)]],
    month:    [this.data?.month    ?? this.today.getMonth(),   Validators.required],
    year:     [this.data?.year     ?? this.today.getFullYear(), Validators.required],
  });

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

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}