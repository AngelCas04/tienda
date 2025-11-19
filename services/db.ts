import { openDB, DBSchema } from 'idb';
import { ProductDef } from '../types';

interface TiendaDB extends DBSchema {
  products: {
    key: string;
    value: ProductDef;
  };
}

const DB_NAME = 'tienda-db';
const STORE_NAME = 'products';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB<TiendaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const getAllProducts = async (): Promise<ProductDef[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const saveProduct = async (product: ProductDef) => {
  const db = await initDB();
  await db.put(STORE_NAME, product);
};

export const deleteProductFromDB = async (id: string) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const clearProductsDB = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME);
}

export const bulkSaveProducts = async (products: ProductDef[]) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await Promise.all([
        ...products.map(p => store.put(p)),
        tx.done
    ]);
}