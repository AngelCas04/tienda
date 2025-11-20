
import { useState, useEffect, useCallback } from 'react';
import { Sale, Invoice } from '../types';
import { addSaleToDB, getSalesByDateRange, getAllSales } from '../services/db';

export const useSales = () => {
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateTotals = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      // Inicio del día (00:00:00)
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      // Inicio de la semana (Lunes)
      const day = now.getDay(); 
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // ajustar cuando es domingo
      const startOfWeek = new Date(now.setDate(diff)).setHours(0,0,0,0);

      // Restaurar fecha para cálculo de mes
      now.setTime(Date.now());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      const endOfTime = Date.now(); // Hasta ahora

      // Obtener todas las ventas (optimización posible: filtrar por rangos específicos)
      // Para simplicidad y precisión, traemos todo y filtramos en memoria si no son miles de registros
      // O usamos índices de IDB. Usaremos índices para mejor performance.
      
      const salesToday = await getSalesByDateRange(startOfDay, endOfTime);
      const salesWeek = await getSalesByDateRange(startOfWeek, endOfTime);
      const salesMonth = await getSalesByDateRange(startOfMonth, endOfTime);

      const sumTotal = (sales: Sale[]) => sales.reduce((acc, curr) => acc + curr.total, 0);

      setTodayTotal(sumTotal(salesToday));
      setWeekTotal(sumTotal(salesWeek));
      setMonthTotal(sumTotal(salesMonth));
      
      // Cargar ventas recientes (últimas 20)
      const allSales = await getAllSales(); // Esto podría optimizarse con un cursor inverso
      setRecentSales(allSales.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20));

    } catch (error) {
      console.error("Error calculating sales totals", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const registerSale = async (invoice: Invoice) => {
    const newSale: Omit<Sale, 'id'> = {
      date: new Date().toISOString(),
      timestamp: Date.now(),
      items: invoice.items,
      total: invoice.grand_total
    };

    await addSaleToDB(newSale);
    await calculateTotals(); // Recalcular estadísticas
    return true;
  };

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    recentSales,
    registerSale,
    refreshSales: calculateTotals,
    isLoading
  };
};
