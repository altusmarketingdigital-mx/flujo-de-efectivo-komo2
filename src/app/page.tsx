'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';

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
    <div className="pb-24 min-h-screen bg-white">
      {/* HEADER CORPORATIVO */}
      <div className="bg-slate-900 text-white px-6 pt-10 pb-8 rounded-b-[2.5rem] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-light tracking-wide text-slate-300">Portafolio</h1>
            <p className="text-sm font-semibold tracking-widest text-slate-400 mt-1 uppercase">Flujo de Efectivo</p>
          </div>
          <Briefcase size={24} className="text-slate-400" strokeWidth={1.5} />
        </div>

        <div className="mb-2">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Balance Neto</p>
          <p className="text-5xl font-light tracking-tight">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="px-6 -mt-5">
        <div className="bg-white p-1 rounded-lg shadow-lg border border-slate-100 flex text-xs font-semibold uppercase tracking-widest">
          <button onClick={() => setReport('WEEK')} className={`flex-1 py-3 text-center rounded-md transition-colors ${report === 'WEEK' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>Semana</button>
          <button onClick={() => setReport('MONTH')} className={`flex-1 py-3 text-center rounded-md transition-colors ${report === 'MONTH' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>Mes</button>
          <button onClick={() => setReport('YEAR')} className={`flex-1 py-3 text-center rounded-md transition-colors ${report === 'YEAR' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>Año</button>
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="border-l-2 border-emerald-500 pl-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ingresos</p>
            <p className="text-xl font-medium text-slate-900">${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="border-l-2 border-rose-500 pl-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Gastos</p>
            <p className="text-xl font-medium text-slate-900">${expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Transacciones Recientes</h2>
        </div>

        <div className="space-y-0">
          {data.slice(0, 5).map(t => {
            const isIncome = t.type === 'INCOME';
            return (
              <div key={t.id} className="flex justify-between items-center py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {isIncome ? <ArrowUpRight size={18} className="text-emerald-500" strokeWidth={2} /> : <ArrowDownRight size={18} className="text-rose-500" strokeWidth={2} />}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.concept}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide uppercase">{t.category} • {new Date(t.date).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isIncome ? '+' : '-'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )
          })}
          {data.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              Sin actividad financiera registrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
