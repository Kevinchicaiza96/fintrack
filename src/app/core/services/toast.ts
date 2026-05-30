import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {

  private snackBar = inject(MatSnackBar);

  private config(type: ToastType): MatSnackBarConfig {
    return {
      duration:           3000,
      horizontalPosition: 'right',
      verticalPosition:   'bottom',
      panelClass:         [`toast-${type}`],
    };
  }

  success(message: string): void {
    this.snackBar.open(`✓  ${message}`, '', this.config('success'));
  }

  error(message: string): void {
    this.snackBar.open(`✕  ${message}`, '', this.config('error'));
  }

  warning(message: string): void {
    this.snackBar.open(`⚠  ${message}`, '', this.config('warning'));
  }

  info(message: string): void {
    this.snackBar.open(`ℹ  ${message}`, '', this.config('info'));
  }
}