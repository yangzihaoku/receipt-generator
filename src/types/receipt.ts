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

export interface ReceiptData {
  merchant: string;
  address: string;
  phone: string;
  date: string;
  time?: string;
  amount: string;
  taxRate: number;
  tipRate: number;
  subtotal: string;
  tax: string;
  tip: string;
  orderNumber?: string;
  cashier?: string;
  terminal?: string;
  paymentMethod?: string;
  cardNumber?: string;
  authCode?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  // 可选项
  hasLogo?: boolean;
  showItems?: boolean;
  showPaymentDetails?: boolean;
  showOrderNumber?: boolean;
  storeNumber?: string;
  registerNumber?: string;
  transactionNumber?: string;
  employeeId?: string;
  shiftNumber?: string;
  departmentCodes?: Record<string, string>;
  warrantyInfo?: {
    period: string;
    terms: string;
  };
  returnPolicy?: string;
  customerInfo?: {
    memberNumber?: string;
    pointsBalance?: number;
    pointsEarned?: number;
  };
  promotions?: Array<{
    description: string;
    savings: number;
  }>;
  environmentalInfo?: {
    paperSaved?: string;
    carbonFootprint?: string;
  };
} 