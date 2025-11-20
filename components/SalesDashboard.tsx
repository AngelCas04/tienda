
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSales } from '../hooks/useSales';
import { BackIcon } from './icons/BackIcon';
import { MoneyIcon } from './icons/MoneyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const SalesDashboard: React.FC = () => {
  const { todayTotal, weekTotal, monthTotal, recentSales, isLoading } = useSales();
  const [showCutAnimation, setShowCutAnimation] = useState(false);

  const handleEndOfDay = () => {
    setShowCutAnimation(true);
    // Ocultar animación después de 3 segundos
    setTimeout(() => {
      setShowCutAnimation(false);
    }, 3500);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-cyan-500">Cargando finanzas...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-6 relative overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-800 p-4 sticky top-0 z-10 shadow-md flex items-center gap-3">
        <Link to="/" className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white">
          <BackIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-cyan-400">Gestión de Ventas</h1>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        
        {/* Resumen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hoy */}
          <div className="bg-gradient-to-br from-cyan-600/20 to-slate-800 border border-cyan-500/30 p-5 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm uppercase font-semibold tracking-wider">Venta Diaria</p>
                <h2 className="text-3xl font-bold text-white mt-1">{formatCurrency(todayTotal)}</h2>
              </div>
              <div className="p-2 bg-cyan-500/20 rounded-full text-cyan-400">
                <MoneyIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Semana */}
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md">
            <p className="text-slate-400 text-sm uppercase font-semibold tracking-wider">Esta Semana</p>
            <h2 className="text-2xl font-bold text-slate-200 mt-1">{formatCurrency(weekTotal)}</h2>
            <p className="text-xs text-slate-500 mt-2">Acumulado semanal</p>
          </div>

          {/* Mes */}
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md">
            <p className="text-slate-400 text-sm uppercase font-semibold tracking-wider">Este Mes</p>
            <h2 className="text-2xl font-bold text-slate-200 mt-1">{formatCurrency(monthTotal)}</h2>
            <p className="text-xs text-slate-500 mt-2">Acumulado mensual</p>
          </div>
        </div>

        {/* Botón Corte del Día */}
        <button
            onClick={handleEndOfDay}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
            <CheckCircleIcon className="w-6 h-6" />
            REALIZAR CORTE DEL DÍA
        </button>

        {/* Historial Reciente */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <h3 className="p-4 bg-slate-800/80 border-b border-slate-700 font-semibold text-lg text-slate-200">
            Últimas Ventas
          </h3>
          <div className="divide-y divide-slate-700">
            {recentSales.length === 0 ? (
              <p className="p-6 text-center text-slate-500">No hay ventas registradas hoy.</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="p-4 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
                  <div>
                    <p className="text-slate-300 font-medium">
                        {sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(sale.timestamp)}</p>
                  </div>
                  <span className="text-cyan-400 font-bold font-mono">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Animación de Corte */}
      {showCutAnimation && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md animate-fadeIn">
            <div className="bg-white text-slate-900 p-8 rounded-sm shadow-2xl max-w-sm w-full transform animate-receipt-print relative">
                {/* Efecto papel roto arriba */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-slate-900/95 -mt-2 clip-path-zigzag"></div>
                
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircleIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">Corte Exitoso</h2>
                    <div className="border-y-2 border-dashed border-slate-300 py-4 my-4">
                        <p className="text-sm text-slate-500 uppercase">Total del Día</p>
                        <p className="text-4xl font-black font-mono mt-1">{formatCurrency(todayTotal)}</p>
                    </div>
                    <p className="text-xs text-slate-400">Guardado en base de datos</p>
                </div>

                {/* Efecto papel roto abajo */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-900/95 -mb-2 clip-path-zigzag rotate-180"></div>
            </div>
        </div>
      )}
      
      <style>{`
        @keyframes receipt-print {
            0% { transform: translateY(-50px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        .clip-path-zigzag {
            background-image: linear-gradient(135deg, #0f172a 25%, transparent 25%), linear-gradient(225deg, #0f172a 25%, transparent 25%);
            background-position: 0 0;
            background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default SalesDashboard;
