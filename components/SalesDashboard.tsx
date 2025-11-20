
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSales } from '../hooks/useSales';
import { BackIcon } from './icons/BackIcon';
import { MoneyIcon } from './icons/MoneyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CalculatorIcon } from './icons/CalculatorIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { PlusIcon } from './icons/PlusIcon';

const SalesDashboard: React.FC = () => {
  const { todayTotal, weekTotal, monthTotal, recentSales, weeklyData, addManualSale, isLoading } = useSales();
  const [activeTab, setActiveTab] = useState<'register' | 'dashboard'>('register');
  const [manualAmount, setManualAmount] = useState('');
  const [showCutAnimation, setShowCutAnimation] = useState(false);

  const handleAddSale = async (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(manualAmount);
      if (amount > 0) {
          await addManualSale(amount, "Venta manual");
          setManualAmount('');
      }
  };

  const handleEndOfDay = () => {
    setShowCutAnimation(true);
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
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 relative overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-800 p-4 sticky top-0 z-10 shadow-md flex items-center gap-3">
        <Link to="/" className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white">
          <BackIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-cyan-400">Gestión de Ventas</h1>
      </header>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-700 bg-slate-800/50">
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                activeTab === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'
            }`}
          >
              <CalculatorIcon className="w-4 h-4" /> Caja
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                activeTab === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'
            }`}
          >
              <BarChartIcon className="w-4 h-4" /> Dashboard
          </button>
      </div>

      <main className="p-4 max-w-md mx-auto space-y-6">
        
        {/* VISTA DE CAJA (REGISTRO) */}
        {activeTab === 'register' && (
            <div className="space-y-6 animate-fadeIn">
                {/* Input Grande */}
                <form onSubmit={handleAddSale} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-center">
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Ingresar Monto de Venta</label>
                    <div className="relative max-w-[200px] mx-auto">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-cyan-500 text-3xl font-bold">$</span>
                        <input 
                            type="number" 
                            step="0.01" 
                            inputMode="decimal"
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-cyan-500/50 focus:border-cyan-500 text-4xl font-bold text-white py-2 pl-8 focus:outline-none"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!manualAmount}
                        className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" /> AGREGAR
                    </button>
                </form>

                {/* Total Hoy y Corte */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Total Hoy</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(todayTotal)}</p>
                    </div>
                    <button 
                        onClick={handleEndOfDay}
                        className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2"
                    >
                        <CheckCircleIcon className="w-4 h-4" /> CORTE
                    </button>
                </div>

                {/* Lista de Hoy */}
                <div>
                    <h3 className="text-sm text-slate-500 font-bold mb-3 uppercase">Movimientos de Hoy</h3>
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden max-h-64 overflow-y-auto">
                        {recentSales.length === 0 ? (
                             <p className="p-4 text-center text-slate-500 text-sm">Sin ventas hoy.</p>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium">
                                                {sale.note || (sale.items ? 'Venta chat' : 'Venta manual')}
                                            </p>
                                            <p className="text-xs text-slate-500">{formatDate(sale.timestamp)}</p>
                                        </div>
                                        <span className="text-cyan-400 font-bold font-mono">
                                            {formatCurrency(sale.total)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* VISTA DASHBOARD (GRÁFICAS) */}
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
                
                {/* Gráfica Semanal */}
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
                    <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5 text-cyan-500" />
                        Ventas Últimos 7 Días
                    </h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {weeklyData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="w-full bg-slate-700/30 rounded-t-md relative h-32 flex items-end justify-center">
                                    <div 
                                        className="w-full bg-cyan-500 rounded-t-sm transition-all duration-500 hover:bg-cyan-400 relative group-hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                        style={{ height: `${Math.max(d.height, 5)}%` }}
                                    ></div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-slate-600 whitespace-nowrap z-10">
                                        {formatCurrency(d.total)}
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumen Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-slate-500 text-xs uppercase font-bold">Semana</p>
                        <p className="text-xl font-bold text-white mt-1">{formatCurrency(weekTotal)}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-slate-500 text-xs uppercase font-bold">Mes</p>
                        <p className="text-xl font-bold text-white mt-1">{formatCurrency(monthTotal)}</p>
                    </div>
                </div>
            </div>
        )}
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
                    <p className="text-xs text-slate-400">Caja cuadrada correctamente</p>
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
