
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
  items?: InvoiceItem[]; // Opcional para ventas manuales
  total: number;
  note?: string; // Nota opcional (ej: "Venta manual")
}
