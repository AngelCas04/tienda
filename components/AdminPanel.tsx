import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({ name: '', price: '', unit: '', keywords: '', category: '', stock: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      unit: formData.unit,
      keywords: formData.keywords.split(',').map(k => k.trim()),
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      description: ''
    };

    if (editingProduct) {
      onEdit(editingProduct.id, productData);
    } else {
      onAdd(productData);
    }
    setIsModalOpen(false);
    setFormData({ name: '', price: '', unit: '', keywords: '', category: '', stock: '' });
    setEditingProduct(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit || '',
      keywords: product.keywords?.join(', ') || '',
      category: product.category,
      stock: product.stock?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', unit: '', keywords: '', category: '', stock: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl backdrop-blur-sm border border-slate-700/50 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Panel de Administración</h1>
            <p className="text-slate-400 text-sm mt-1">Gestiona tu inventario y productos</p>
          </div>
          <Link to="/" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-all border border-slate-600 hover:border-slate-500 shadow-md">
            Volver al Chat
          </Link>
        </header>

        <div className="flex flex-wrap gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <button onClick={onReset} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
            Restaurar Defaults
          </button>
          <button onClick={onExport} className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium">
            Exportar JSON
          </button>
          <label className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors text-sm font-medium cursor-pointer">
            Importar JSON
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button onClick={openNew} className="ml-auto px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-900/20 transition-all transform hover:scale-105 font-bold">
            + Nuevo Producto
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="p-5">Nombre</th>
                  <th className="p-5">Precio</th>
                  <th className="p-5">Stock</th>
                  <th className="p-5">Categoría</th>
                  <th className="p-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-5 font-medium text-slate-200">{product.name}</td>
                    <td className="p-5 text-cyan-400 font-mono">${product.price.toFixed(2)}</td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${(product.stock || 0) > 10 ? 'bg-green-500/20 text-green-400' :
                          (product.stock || 0) > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="p-5 text-slate-400">{product.category}</td>
                    <td className="p-5 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(product)} className="text-blue-400 hover:text-blue-300 font-medium text-sm">Editar</button>
                      <button onClick={() => onDelete(product.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombre del Producto</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                  placeholder="Ej: Arroz Blanco"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Precio ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Categoría</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                  placeholder="Ej: Granos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Palabras Clave (separar por comas)</label>
                <textarea
                  rows={3}
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-none transition-all"
                  placeholder="arroz, precocido, blanco"
                />
                <p className="text-xs text-slate-500 mt-1">Ayuda al asistente a reconocer el producto.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition-all transform active:scale-95"
              >
                <SaveIcon className="w-5 h-5" />
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;