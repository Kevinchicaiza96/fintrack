export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary' | 'freelance' | 'investment' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'health'
  | 'entertainment' | 'education' | 'shopping' | 'other_expense';

export interface Transaction {
  id:          string;
  type:        TransactionType;
  amount:      number;
  description: string;
  category:    TransactionCategory;
  date:        Date;
  note:        string;
  createdAt:   Date;
}

export const INCOME_CATEGORIES: { value: TransactionCategory; label: string; icon: string }[] = [
  { value: 'salary',       label: 'Salario',     icon: 'work' },
  { value: 'freelance',    label: 'Freelance',   icon: 'laptop' },
  { value: 'investment',   label: 'Inversión',   icon: 'trending_up' },
  { value: 'other_income', label: 'Otro',        icon: 'attach_money' },
];

export const EXPENSE_CATEGORIES: { value: TransactionCategory; label: string; icon: string }[] = [
  { value: 'food',          label: 'Comida',       icon: 'restaurant' },
  { value: 'transport',     label: 'Transporte',   icon: 'directions_car' },
  { value: 'housing',       label: 'Vivienda',     icon: 'home' },
  { value: 'health',        label: 'Salud',        icon: 'favorite' },
  { value: 'entertainment', label: 'Ocio',         icon: 'sports_esports' },
  { value: 'education',     label: 'Educación',    icon: 'school' },
  { value: 'shopping',      label: 'Compras',      icon: 'shopping_bag' },
  { value: 'other_expense', label: 'Otro',         icon: 'more_horiz' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function getCategoryLabel(category: TransactionCategory): string {
  return ALL_CATEGORIES.find(c => c.value === category)?.label ?? category;
}

export function getCategoryIcon(category: TransactionCategory): string {
  return ALL_CATEGORIES.find(c => c.value === category)?.icon ?? 'circle';
}