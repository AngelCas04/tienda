
import { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types';
import { addSaleToDB, getSalesByDateRange } from '../services/db';

export const useSales = () => {
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [weeklyData, setWeeklyData] = useState<{day: string, total: number, height: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateTotals = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const endOfTime = Date.now(); 

      // 1. Totales de Hoy
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const salesToday = await getSalesByDateRange(startOfDay, endOfTime);
      setTodayTotal(salesToday.reduce((acc, curr) => acc + curr.total, 0));
      
      // Ordenar ventas de hoy para la lista (más recientes primero)
      setRecentSales(salesToday.sort((a, b) => b.timestamp - a.timestamp));

      // 2. Totales de Semana
      const day = now.getDay(); 
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
      const startOfWeek = new Date(now.setDate(diff)).setHours(0,0,0,0);
      // Restaurar fecha
      now.setTime(Date.now());
      
      const salesWeek = await getSalesByDateRange(startOfWeek, endOfTime);
      setWeekTotal(salesWeek.reduce((acc, curr) => acc + curr.total, 0));

      // 3. Totales de Mes
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const salesMonth = await getSalesByDateRange(startOfMonth, endOfTime);
      setMonthTotal(salesMonth.reduce((acc, curr) => acc + curr.total, 0));

      // 4. Datos para la Gráfica (Últimos 7 días)
      const chartData = [];
      let maxDailyTotal = 0;

      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0,0,0,0);
          const start = d.getTime();
          
          const dEnd = new Date(d);
          dEnd.setHours(23,59,59,999);
          const end = dEnd.getTime();

          const dailySales = await getSalesByDateRange(start, end);
          const total = dailySales.reduce((acc, s) => acc + s.total, 0);
          
          if (total > maxDailyTotal) maxDailyTotal = total;

          const dayName = d.toLocaleDateString('es-MX', { weekday: 'short' });
          chartData.push({
              day: dayName.charAt(0).toUpperCase() + dayName.slice(1, 2), // L, M, M...
              fullDay: dayName,
              total: total,
              height: 0 // Se calculará abajo
          });
      }

      // Normalizar altura para gráfica (0 a 100%)
      const normalizedChartData = chartData.map(d => ({
          ...d,
          height: maxDailyTotal > 0 ? Math.round((d.total / maxDailyTotal) * 100) : 0
      }));
      setWeeklyData(normalizedChartData);

    } catch (error) {
      console.error("Error calculating sales totals", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const addManualSale = async (amount: number, note?: string) => {
      const newSale: Omit<Sale, 'id'> = {
          date: new Date().toISOString(),
          timestamp: Date.now(),
          total: amount,
          note: note || "Venta manual"
      };
      await addSaleToDB(newSale);
      await calculateTotals();
  };

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    recentSales,
    weeklyData,
    addManualSale,
    refreshSales: calculateTotals,
    isLoading
  };
};
