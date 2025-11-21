import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useProducts } from './hooks/useProducts';

// Lazy loading components
const ChatInterface = React.lazy(() => import('./components/ChatInterface'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const SalesDashboard = React.lazy(() => import('./components/SalesDashboard'));

const LoadingSpinner = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-dark-bg text-primary-400">
    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
    <p className="animate-pulse font-medium">Cargando experiencia...</p>
  </div>
);

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
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<ChatInterface products={products} />} />
        <Route path="/ventas" element={<SalesDashboard />} />
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
    </Suspense>
  );
};

export default App;
