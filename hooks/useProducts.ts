
import { useState, useEffect } from 'react';
import { ProductDef } from '../types';
import { DEFAULT_PRODUCTS } from '../constants';

const STORAGE_KEY = 'tienda_gemini_products';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDef[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar al inicio
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored products", e);
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isLoaded]);

  const addProduct = (product: Omit<ProductDef, 'id'>) => {
    const newProduct: ProductDef = {
      ...product,
      id: Date.now().toString(), // ID simple basado en timestamp
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updated: Partial<ProductDef>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const resetProducts = () => {
    if(confirm("¿Estás seguro de que quieres restaurar la lista de productos por defecto? Se perderán tus cambios.")) {
        setProducts(DEFAULT_PRODUCTS);
    }
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    isLoaded
  };
};
