
import { openDB, DBSchema } from 'idb';
import { Product, Sale } from '../types';

interface TiendaDB extends DBSchema {
  products: {
    key: string;
    value: Product;
  };
  sales: {
    key: number;
    value: Sale;
    indexes: { 'timestamp': number };
  };
}

const DB_NAME = 'tienda-db';
const STORE_PRODUCTS = 'products';
const STORE_SALES = 'sales';
const DB_VERSION = 2; // Incrementamos versión para añadir store de ventas

export const initDB = async () => {
  return openDB<TiendaDB>(DB_NAME, DB_VERSION, {
    // Usamos guión bajo para indicar variables no usadas y evitar errores de TS
    upgrade(db, _oldVersion, _newVersion, _transaction) {
      // Store de Productos
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }

      // Store de Ventas (Nueva en v2)
      if (!db.objectStoreNames.contains(STORE_SALES)) {
        const salesStore = db.createObjectStore(STORE_SALES, { keyPath: 'id', autoIncrement: true });
        salesStore.createIndex('timestamp', 'timestamp');
      }
    },
  });
};

// --- PRODUCTOS ---

export const getAllProducts = async (): Promise<Product[]> => {
  const db = await initDB();
  return db.getAll(STORE_PRODUCTS);
};

export const saveProduct = async (product: Product) => {
  const db = await initDB();
  await db.put(STORE_PRODUCTS, product);
};

export const deleteProductFromDB = async (id: string) => {
  const db = await initDB();
  await db.delete(STORE_PRODUCTS, id);
};

export const clearProductsDB = async () => {
  const db = await initDB();
  await db.clear(STORE_PRODUCTS);
}

export const bulkSaveProducts = async (products: Product[]) => {
  const db = await initDB();
  const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
  const store = tx.objectStore(STORE_PRODUCTS);
  await Promise.all([
    ...products.map(p => store.put(p)),
    tx.done
  ]);
}

// --- VENTAS ---

export const addSaleToDB = async (sale: Omit<Sale, 'id'>) => {
  const db = await initDB();
  return db.add(STORE_SALES, sale as Sale);
};

export const getSalesByDateRange = async (startTimestamp: number, endTimestamp: number): Promise<Sale[]> => {
  const db = await initDB();
  const range = IDBKeyRange.bound(startTimestamp, endTimestamp);
  return db.getAllFromIndex(STORE_SALES, 'timestamp', range);
};

export const getAllSales = async (): Promise<Sale[]> => {
  const db = await initDB();
  return db.getAll(STORE_SALES);
};
