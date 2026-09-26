'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Resumen Financiero</h1>
      
      <div className="flex bg-gray-100 p-1 rounded-lg mb-6 text-sm">
        <button onClick={() => setReport('WEEK')} className={`flex-1 py-1.5 rounded-md font-semibold ${report === 'WEEK' ? 'bg-black text-white shadow' : 'text-gray-500'}`}>Semana</button>
        <button onClick={() => setReport('MONTH')} className={`flex-1 py-1.5 rounded-md font-semibold ${report === 'MONTH' ? 'bg-black text-white shadow' : 'text-gray-500'}`}>Mes</button>
        <button onClick={() => setReport('YEAR')} className={`flex-1 py-1.5 rounded-md font-semibold ${report === 'YEAR' ? 'bg-black text-white shadow' : 'text-gray-500'}`}>Año</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm text-green-600 font-medium">Ingresos</p>
          <p className="text-xl font-bold text-green-700">${income.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm text-red-600 font-medium">Gastos</p>
          <p className="text-xl font-bold text-red-700">${expense.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-blue-600 p-6 rounded-xl text-white mb-8 shadow-lg">
        <p className="text-blue-100 font-medium mb-1">Balance Neto</p>
        <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Últimos Movimientos</h2>
      <div className="space-y-3">
        {data.slice(0, 5).map(t => (
          <div key={t.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
            <div>
              <p className="font-semibold">{t.concept} {t.frequency && t.frequency !== 'DIA' && <span className="text-[10px] bg-black text-white px-1 py-0.5 rounded ml-1">x {t.frequency}</span>}</p>
              <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
            </div>
            <p className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
