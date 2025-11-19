
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductDef } from '../types';
import { BackIcon } from './icons/BackIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SaveIcon } from './icons/SaveIcon';
import { XIcon } from './icons/XIcon';

interface AdminPanelProps {
  products: ProductDef[];
  onAdd: (p: Omit<ProductDef, 'id'>) => void;
  onEdit: (id: string, p: Partial<ProductDef>) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, onAdd, onEdit, onDelete, onReset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDef | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: '',
    keywords: ''
  });

  const filteredProducts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerSearch) || 
      p.keywords.some(k => k.toLowerCase().includes(lowerSearch))
    );
  }, [products, searchTerm]);

  const handleOpenModal = (product?: ProductDef) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        unit: product.unit,
        keywords: product.keywords.join(', ')
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        unit: 'unidad',
        keywords: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const priceNum = parseFloat(formData.price);

    if (!formData.name || isNaN(priceNum)) return;

    if (editingProduct) {
      onEdit(editingProduct.id, {
        name: formData.name,
        price: priceNum,
        unit: formData.unit,
        keywords: keywordsArray
      });
    } else {
      onAdd({
        name: formData.name,
        price: priceNum,
        unit: formData.unit,
        keywords: keywordsArray
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="bg-slate-800 p-4 sticky top-0 z-10 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white">
            <BackIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-cyan-400">Administrar Productos</h1>
        </div>
        <button 
            onClick={onReset}
            className="text-xs text-red-400 hover:text-red-300 underline"
        >
            Restaurar Todo
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {filteredProducts.map(prod => (
            <div key={prod.id} className="bg-slate-800 rounded-lg p-4 flex items-center justify-between shadow-sm border border-slate-700">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{prod.name}</h3>
                <div className="text-sm text-slate-400 flex flex-wrap gap-2 mt-1">
                  <span className="text-cyan-400 font-mono">${prod.price.toFixed(2)}</span>
                  <span>/ {prod.unit}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  Keywords: {prod.keywords.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={() => handleOpenModal(prod)}
                  className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full"
                >
                  <EditIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { if(confirm('¿Borrar producto?')) onDelete(prod.id) }}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-full"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              No se encontraron productos.
            </div>
          )}
        </div>
      </main>

      {/* FAB Add Button */}
      <button 
        onClick={() => handleOpenModal()}
        className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-slate-900 p-4 rounded-full shadow-lg shadow-cyan-500/20 transition-transform active:scale-95"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                  placeholder="Ej: Arroz Blanco"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Precio ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Unidad</label>
                  <input 
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                    placeholder="unidad, lb, caja"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Palabras Clave (separar por comas)</label>
                <input 
                  type="text"
                  value={formData.keywords}
                  onChange={e => setFormData({...formData, keywords: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                  placeholder="arroz, precocido, blanco"
                />
                <p className="text-xs text-slate-500 mt-1">Ayuda al asistente a reconocer el producto.</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2"
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
