
export interface InvoiceItem {
  quantity: string;
  product: string;
  unit_price: number;
  subtotal: number;
}

export interface Invoice {
  items: InvoiceItem[];
  total_items: number;
  grand_total: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  invoice?: Invoice;
  isLoading?: boolean;
}
