import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useProducts } from './hooks/useProducts';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    resetProducts, 
    exportProducts,
    importProducts,
    isLoaded 
  } = useProducts();

  if (!isLoaded) {
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-cyan-500">Cargando datos...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<ChatInterface products={products} />} />
      <Route path="/admin" element={
        <AdminPanel 
          products={products}
          onAdd={addProduct}
          onEdit={updateProduct}
          onDelete={deleteProduct}
          onReset={resetProducts}
          onExport={exportProducts}
          onImport={importProducts}
        />
      } />
    </Routes>
  );
};

export default App;