
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
  onRegisterSale?: (invoice: Invoice) => void; // Callback para registrar venta
}

export interface ProductDef {
  id: string;
  keywords: string[];
  price: number;
  name: string;
  unit: string;
}

export interface Sale {
  id?: number; // ID autogenerado por IndexedDB
  date: string; // ISO String
  timestamp: number;
  items: InvoiceItem[];
  total: number;
}
