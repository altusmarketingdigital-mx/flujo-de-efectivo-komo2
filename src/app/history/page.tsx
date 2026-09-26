'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    let query = supabase.from('transactions').select('*').order('date', { ascending: false });
    if (filter !== 'ALL') query = query.eq('type', filter);
    const { data, error } = await query;
    if (data) setTransactions(data);
    else if (error) toast.error("Error al cargar historial: " + error.message);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Confirmas la anulación de esta operación?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) toast.error("Error: " + error.message);
      else {
        toast.success("Operación anulada exitosamente");
        fetchTransactions();
      }
    }
  };

  const exportCSV = () => {
    const headers = ['Fecha,Tipo,Monto,Concepto,Categoria,Metodo_Pago,Frecuencia\n'];
    const csvContent = transactions.map(t => {
      return `${new Date(t.date).toISOString().split('T')[0]},${t.type},${t.amount},"${t.concept}","${t.category}",${t.payment_method},${t.frequency}`;
    }).join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Reporte_Operaciones.csv');
    a.click();
    toast.success("Reporte exportado");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 px-6 py-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Libro Mayor</h1>
        <button onClick={exportCSV} className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-900 transition-colors">
          <Download size={14} strokeWidth={2.5} /> Exportar
        </button>
      </div>

      <div className="px-6 mt-6">
        <div className="flex bg-slate-200/50 p-1 rounded-md mb-8">
          {['ALL', 'INCOME', 'EXPENSE'].map(f => (
            <button 
              key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f === 'ALL' ? 'General' : f === 'INCOME' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {transactions.map((t, idx) => {
            const isIncome = t.type === 'INCOME';
            return (
              <div key={t.id} className={`flex justify-between items-center p-4 ${idx !== transactions.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{t.concept}</p>
                    {t.frequency && t.frequency !== 'DIA' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">{t.frequency}</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-medium">
                    {new Date(t.date).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })} • {t.category}
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <p className={`font-medium ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isIncome ? '+' : '-'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )
          })}
          {transactions.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs uppercase tracking-widest">
              Sin operaciones en este filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
