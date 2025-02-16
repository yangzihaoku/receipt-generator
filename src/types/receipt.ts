export interface Receipt {
  id: string;
  date: string;
  amount: string;
  merchant: string;
  address: string;
  phone: string;
  taxRate: number;
  tipRate: number;
  subtotal: string;
  tax: string;
  tip: string;
  template: string;
  createdAt: string;
} 