
import React, { useState, useEffect } from 'react';
import { ProductDef } from '../types';
import { DEFAULT_PRODUCTS } from '../constants';
import { getAllProducts, saveProduct, deleteProductFromDB, clearProductsDB, bulkSaveProducts } from '../services/db';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDef[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar al inicio desde DB
  useEffect(() => {
    const loadProducts = async () => {
      try {
        let storedProducts = await getAllProducts();
        if (storedProducts.length === 0) {
          // Si está vacía, cargar defaults y guardar en DB
          console.log("DB vacía, inicializando con defaults...");
          storedProducts = DEFAULT_PRODUCTS;
          await bulkSaveProducts(DEFAULT_PRODUCTS);
        }
        setProducts(storedProducts);
      } catch (e) {
        console.error("Error loading products from DB", e);
        // Fallback a defaults en memoria si falla DB
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setIsLoaded(true);
      }
    };
    loadProducts();
  }, []);

  const addProduct = async (product: Omit<ProductDef, 'id'>) => {
    const newProduct: ProductDef = {
      ...product,
      id: Date.now().toString(),
    };
    // Actualización optimista
    setProducts(prev => [...prev, newProduct]);
    // Guardar en DB
    await saveProduct(newProduct);
  };

  const updateProduct = async (id: string, updated: Partial<ProductDef>) => {
    const current = products.find(p => p.id === id);
    if (!current) return;

    const updatedProduct = { ...current, ...updated };
    
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    await saveProduct(updatedProduct);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await deleteProductFromDB(id);
  };

  const resetProducts = async () => {
    if(confirm("¿Estás seguro de que quieres restaurar la lista de productos por defecto? Se perderán tus cambios actuales.")) {
        setProducts(DEFAULT_PRODUCTS);
        await clearProductsDB();
        await bulkSaveProducts(DEFAULT_PRODUCTS);
    }
  };

  const exportProducts = () => {
      const dataStr = JSON.stringify(products, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tienda_respaldo_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const importProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              // Validación básica
              if (Array.isArray(json) && json.every(p => p.id && p.name && p.price !== undefined)) {
                  if (confirm(`¿Importar ${json.length} productos? Esto reemplazará la lista actual.`)) {
                      setProducts(json);
                      await clearProductsDB();
                      await bulkSaveProducts(json);
                      alert('Importación exitosa');
                  }
              } else {
                  alert('El archivo no tiene el formato correcto de productos.');
              }
          } catch (err) {
              console.error(err);
              alert('Error al leer el archivo');
          }
      };
      reader.readAsText(file);
      // Resetear el input para permitir cargar el mismo archivo si es necesario
      e.target.value = '';
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    exportProducts,
    importProducts,
    isLoaded
  };
};
