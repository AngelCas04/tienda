import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { XIcon } from './icons/XIcon';

interface AdminPanelProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => void;
  onEdit: (id: string, product: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, onAdd, onEdit, onDelete, onReset, onExport, onImport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', unit: '', keywords: '', category: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categorías únicas
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))].filter(Boolean).sort();
    return ['all', ...cats];
  }, [products]);

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      unit: formData.unit,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      category: formData.category,
      stock: 100, // Default
      description: ''
    };

    if (editingProduct) {
      onEdit(editingProduct.id, productData);
    } else {
      onAdd(productData);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', price: '', unit: '', keywords: '', category: '' });
    setEditingProduct(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit || '',
      keywords: product.keywords?.join(', ') || '',
      category: product.category
    });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', unit: '', keywords: '', category: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/30 shadow-2xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Administración
            </h1>
            <p className="text-slate-400 text-sm mt-1 tracking-wide">
              {products.length} productos • {categories.length - 1} categorías
            </p>
          </div>
          <Link
            to="/"
            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 transition-all border border-slate-600/50 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Chat
          </Link>
        </header>

        {/* Search & Actions */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl text-slate-200 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer min-w-[180px]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-800">
                {cat === 'all' ? '🏷️ Todas las categorías' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 p-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/20">
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-xl transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Exportar
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-xl transition-all text-sm font-medium cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Importar
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restaurar
            </button>
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="text-sm text-slate-400 px-2">
            {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para "{searchQuery}"
          </p>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-slate-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Category badge */}
              <span className="inline-block px-2.5 py-1 mb-3 text-xs font-medium bg-slate-700/50 text-slate-400 rounded-lg">
                {product.category}
              </span>

              {/* Product name */}
              <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <p className="text-2xl font-bold text-emerald-400 mb-3">
                ${product.price.toFixed(2)}
                <span className="text-sm font-normal text-slate-500 ml-1">/{product.unit}</span>
              </p>

              {/* Keywords */}
              {product.keywords && product.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.keywords.slice(0, 3).map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-slate-700/30 text-slate-500 rounded">
                      {kw}
                    </span>
                  ))}
                  {product.keywords.length > 3 && (
                    <span className="text-xs text-slate-600">+{product.keywords.length - 3}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">No se encontraron productos</h3>
            <p className="text-slate-500 text-sm">Intenta con otra búsqueda o categoría</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="bg-slate-800/95 backdrop-blur-xl rounded-3xl w-full max-w-lg border border-slate-700/50 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {editingProduct ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al inventario'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del producto</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl p-3.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  placeholder="Ej: Arroz Blanco"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Precio ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl p-3.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Unidad</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl p-3.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    placeholder="lb, unidad, caja..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl p-3.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  placeholder="Ej: Granos, Lácteos, Bebidas..."
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Palabras clave
                  <span className="font-normal text-slate-500 ml-1">(separar por comas)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl p-3.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all"
                  placeholder="arroz, precocido, blanco"
                />
                <p className="text-xs text-slate-500 mt-1.5">Ayudan al asistente a reconocer el producto por voz</p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98]"
              >
                <SaveIcon className="w-5 h-5" />
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;