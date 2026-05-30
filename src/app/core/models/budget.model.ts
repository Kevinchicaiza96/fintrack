import { TransactionCategory } from './transaction.model';

export interface Budget {
  id:        string;
  category:  TransactionCategory;
  limit:     number;
  month:     number;
  year:      number;
  createdAt: Date;
}