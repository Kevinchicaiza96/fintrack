import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cop',
  standalone: true
})
export class CurrencyCopPipe implements PipeTransform {

  transform(value: number | null | undefined, showSign: boolean = false): string {
    if (value === null || value === undefined) return '$0';

    const formatted = new Intl.NumberFormat('es-CO', {
      style:                 'currency',
      currency:              'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));

    const clean = formatted.replace(/\$\s/, '$');

    if (showSign) {
      return value >= 0 ? `+${clean}` : `-${clean}`;
    }

    return value < 0 ? `-${clean}` : clean;
  }
}