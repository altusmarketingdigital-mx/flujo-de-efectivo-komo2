'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export default function Home() {
  const [report, setReport] = useState('WEEK');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [report]);

  const fetchData = async () => {
    const { data: txs } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (txs) setData(txs);
  };

  let income = 0; let expense = 0;
  data.forEach(t => {
    if (t.type === 'INCOME') income += Number(t.amount);
    if (t.type === 'EXPENSE') expense += Number(t.amount);
  });
  const balance = income - expense;

  return (
    <div className="p-5 pb-24 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Resumen</h1>
        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
          <Wallet size={20} className="text-blue-600" />
        </div>
      </div>
      
      {/* Selector de periodo tipo iOS */}
      <div className="flex bg-gray-200/60 p-1.5 rounded-xl mb-6 text-sm font-medium backdrop-blur-sm">
        <button onClick={() => setReport('WEEK')} className={`flex-1 py-2 rounded-lg transition-all ${report === 'WEEK' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Semana</button>
        <button onClick={() => setReport('MONTH')} className={`flex-1 py-2 rounded-lg transition-all ${report === 'MONTH' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Mes</button>
        <button onClick={() => setReport('YEAR')} className={`flex-1 py-2 rounded-lg transition-all ${report === 'YEAR' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Año</button>
      </div>

      {/* Tarjeta Principal de Balance */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl text-white mb-6 shadow-xl shadow-gray-900/20 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 bg-white/5 w-32 h-32 rounded-full blur-2xl"></div>
        <div className="absolute -left-8 -bottom-8 bg-blue-500/20 w-32 h-32 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-gray-400 font-medium mb-1 text-sm uppercase tracking-wider">Balance Total</p>
          <p className="text-4xl font-extrabold tracking-tight">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Tarjetas de Ingresos / Gastos */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ingresos</p>
          </div>
          <p className="text-xl font-bold text-gray-900">${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-100 rounded-full">
              <TrendingDown size={16} className="text-red-600" />
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Gastos</p>
          </div>
          <p className="text-xl font-bold text-gray-900">${expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Últimos Movimientos */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Últimos Movimientos</h2>
      <div className="space-y-3">
        {data.slice(0, 5).map(t => {
          const isIncome = t.type === 'INCOME';
          return (
            <div key={t.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.concept}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{t.category} • {new Date(t.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-extrabold ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
                  {isIncome ? '+' : '-'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                {t.frequency && t.frequency !== 'DIA' && (
                  <span className="inline-block mt-1 text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    {t.frequency}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {data.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
            <p className="text-gray-400 font-medium">Aún no hay movimientos</p>
          </div>
        )}
      </div>
    </div>
  );
}
