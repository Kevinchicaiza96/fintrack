import { Injectable } from '@angular/core';
import { Transaction, getCategoryLabel } from '../models/transaction.model';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportTransactionsToExcel(transactions: Transaction[], filename: string = 'fintrack'): void {

    // ── Hoja de transacciones ──────────────────────
    const data = transactions.map(t => ({
      'Fecha':       new Date(t.date).toLocaleDateString('es-CO'),
      'Tipo':        t.type === 'income' ? 'Ingreso' : 'Gasto',
      'Descripción': t.description,
      'Categoría':   getCategoryLabel(t.category),
      'Monto (COP)': t.type === 'income' ? t.amount : -t.amount,
      'Nota':        t.note || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws['!cols'] = [
      { wch: 14 },
      { wch: 10 },
      { wch: 32 },
      { wch: 16 },
      { wch: 18 },
      { wch: 28 },
    ];

    // Formato numérico en columna Monto
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = 1; row <= range.e.r; row++) {
      const cell = ws[XLSX.utils.encode_cell({ r: row, c: 4 })];
      if (cell) { cell.t = 'n'; cell.z = '#,##0'; }
    }

    // ── Hoja de resumen ────────────────────────────
    const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance       = totalIncome - totalExpenses;
    const fechaExport   = new Date().toLocaleDateString('es-CO');

    const summary = [
      { 'Concepto': 'Fecha de exportación', 'Valor': fechaExport },
      { 'Concepto': 'Total transacciones',  'Valor': transactions.length },
      { 'Concepto': '',                     'Valor': '' },
      { 'Concepto': 'Total ingresos (COP)', 'Valor': totalIncome },
      { 'Concepto': 'Total gastos (COP)',   'Valor': -totalExpenses },
      { 'Concepto': 'Balance (COP)',        'Valor': balance },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    wsSummary['!cols'] = [{ wch: 26 }, { wch: 20 }];

    // Formato numérico en resumen
    ['B4', 'B5', 'B6'].forEach(cell => {
      if (wsSummary[cell]) { wsSummary[cell].t = 'n'; wsSummary[cell].z = '#,##0'; }
    });

    // ── Libro ──────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}