import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSales } from '../hooks/useSales';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
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
        setTimeout(() => setShowCutAnimation(false), 3500);
    };

    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#0a0f1a] gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-slate-400">Cargando finanzas...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-slate-100 pb-24 relative">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="p-2 -ml-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-emerald-400 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Gestión de Ventas
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        En vivo
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex gap-1 p-1 bg-slate-800/30 rounded-xl">
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'register'
                                    ? 'bg-slate-800 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Caja
                        </button>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'dashboard'
                                    ? 'bg-slate-800 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 px-4 py-6 max-w-2xl mx-auto space-y-6">
                {/* REGISTER VIEW */}
                {activeTab === 'register' && (
                    <div className="space-y-6">
                        {/* Today's Total - Hero Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/30 shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                            <div className="relative text-center">
                                <p className="text-slate-400 text-sm font-medium tracking-wider uppercase">Ventas de Hoy</p>
                                <p className="text-6xl font-black mt-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                    {formatCurrency(todayTotal)}
                                </p>
                                <p className="text-slate-500 text-sm mt-2">
                                    {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>

                        {/* Quick Registration */}
                        <form onSubmit={handleAddSale} className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/30">
                            <label className="block text-sm font-medium text-slate-300 mb-3">Registro Rápido</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-medium">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={manualAmount}
                                        onChange={(e) => setManualAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl py-4 pl-10 pr-4 text-white text-xl font-semibold placeholder-slate-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!manualAmount}
                                    className="px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none transform active:scale-95"
                                >
                                    <PlusIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </form>

                        {/* End of Day Button */}
                        <button
                            onClick={handleEndOfDay}
                            className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 backdrop-blur-sm border border-slate-700/30 hover:border-emerald-500/30 rounded-2xl text-slate-300 font-medium flex items-center justify-center gap-3 transition-all group"
                        >
                            <div className="p-1.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                            </div>
                            Realizar Corte de Caja
                        </button>

                        {/* Recent Sales */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ventas Recientes</h3>
                                <span className="text-xs text-slate-500">{recentSales.length} hoy</span>
                            </div>
                            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/30 overflow-hidden">
                                {recentSales.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-500 text-sm">No hay ventas hoy</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-slate-700/30">
                                        {recentSales.map((sale, index) => (
                                            <li
                                                key={sale.id}
                                                className="p-4 flex justify-between items-center hover:bg-slate-700/20 transition-colors"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                        <span className="text-emerald-400 font-bold text-sm">$</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-200">{sale.items?.[0]?.product || "Venta Manual"}</p>
                                                        <p className="text-xs text-slate-500">{formatDate(sale.timestamp)}</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-emerald-400 text-lg">{formatCurrency(sale.total)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* DASHBOARD VIEW */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm p-4 rounded-2xl border border-emerald-500/20">
                                <p className="text-emerald-400/80 text-xs font-medium uppercase">Hoy</p>
                                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(todayTotal)}</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/30">
                                <p className="text-slate-500 text-xs font-medium uppercase">Semana</p>
                                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(weekTotal)}</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/30">
                                <p className="text-slate-500 text-xs font-medium uppercase">Mes</p>
                                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(monthTotal)}</p>
                            </div>
                        </div>

                        {/* Weekly Chart */}
                        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Últimos 7 Días</h3>
                                <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-lg">
                                    {formatCurrency(weekTotal)} total
                                </span>
                            </div>
                            <div className="h-48 flex items-end justify-between gap-2">
                                {weeklyData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                        <div className="w-full bg-slate-700/20 rounded-xl relative h-36 flex items-end justify-center p-1">
                                            <div
                                                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-lg transition-all duration-500 group-hover:from-emerald-500 group-hover:to-emerald-300 relative"
                                                style={{ height: `${Math.max(d.height, 8)}%` }}
                                            >
                                                {/* Glow effect */}
                                                <div className="absolute inset-0 bg-emerald-400 rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 border border-slate-700 whitespace-nowrap z-10 pointer-events-none shadow-xl">
                                                {formatCurrency(d.total)}
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium ${i === 6 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {d.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium">Promedio Diario</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{formatCurrency(weekTotal / 7)}</p>
                            </div>
                            <div className="bg-slate-800/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-teal-500/10 rounded-lg">
                                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium">Ventas Hoy</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{recentSales.length}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Cut Animation */}
            {showCutAnimation && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1a]/95 backdrop-blur-xl">
                    <div className="bg-white text-slate-900 p-10 rounded-lg shadow-2xl max-w-sm w-full mx-4 relative overflow-hidden">
                        {/* Torn paper effect */}
                        <div className="absolute -top-3 left-0 right-0 h-6 bg-[#0a0f1a]" style={{
                            clipPath: 'polygon(0% 100%, 5% 60%, 10% 100%, 15% 60%, 20% 100%, 25% 60%, 30% 100%, 35% 60%, 40% 100%, 45% 60%, 50% 100%, 55% 60%, 60% 100%, 65% 60%, 70% 100%, 75% 60%, 80% 100%, 85% 60%, 90% 100%, 95% 60%, 100% 100%)'
                        }} />

                        <div className="text-center space-y-5 pt-2">
                            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                                <CheckCircleIcon className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-wider">Corte Exitoso</h2>
                                <p className="text-slate-500 text-sm mt-1">Caja cuadrada correctamente</p>
                            </div>
                            <div className="border-y-2 border-dashed border-slate-300 py-5">
                                <p className="text-sm text-slate-500 uppercase font-medium">Total del Día</p>
                                <p className="text-5xl font-black font-mono mt-2">{formatCurrency(todayTotal)}</p>
                            </div>
                            <p className="text-xs text-slate-400">{new Date().toLocaleDateString('es', { dateStyle: 'full' })}</p>
                        </div>

                        {/* Torn paper bottom */}
                        <div className="absolute -bottom-3 left-0 right-0 h-6 bg-[#0a0f1a]" style={{
                            clipPath: 'polygon(0% 0%, 5% 40%, 10% 0%, 15% 40%, 20% 0%, 25% 40%, 30% 0%, 35% 40%, 40% 0%, 45% 40%, 50% 0%, 55% 40%, 60% 0%, 65% 40%, 70% 0%, 75% 40%, 80% 0%, 85% 40%, 90% 0%, 95% 40%, 100% 0%)'
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesDashboard;
