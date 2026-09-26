'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [editingTx, setEditingTx] = useState<any>(null);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [filter]);

  const fetchTransactions = async () => {
    let query = supabase.from('transactions').select('*').order('date', { ascending: false });
    if (filter !== 'ALL') query = query.eq('type', filter);
    const { data, error } = await query;
    if (data) setTransactions(data);
    else if (error) toast.error("Error al cargar historial: " + error.message);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setDbCategories(data);
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx.amount || !editingTx.concept || !editingTx.category || !editingTx.date) {
      return toast.error("Información incompleta");
    }

    const toastId = toast.loading('Actualizando...');
    const fullDate = new Date(editingTx.date.split('T')[0] + 'T12:00:00Z').toISOString();

    const { error } = await supabase.from('transactions').update({
      type: editingTx.type,
      amount: parseFloat(editingTx.amount),
      concept: editingTx.concept,
      category: editingTx.category,
      frequency: editingTx.frequency,
      payment_method: editingTx.payment_method,
      date: fullDate
    }).eq('id', editingTx.id);

    if (error) {
      toast.error('Error al actualizar: ' + error.message, { id: toastId });
    } else {
      toast.success('Operación modificada', { id: toastId });
      setEditingTx(null);
      fetchTransactions();
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
                <div className="text-right flex items-center gap-3">
                  <p className={`font-medium ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isIncome ? '+' : '-'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <button onClick={() => {
                    setEditingTx({
                      ...t,
                      date: t.date.split('T')[0]
                    });
                  }} className="text-slate-300 hover:text-slate-600 transition-colors ml-2">
                    <Edit2 size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={18} strokeWidth={2.5} />
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

      {/* MODAL DE EDICIÓN */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Modificar Operación</h2>
              <button onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-slate-900">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-5">
              
              <div className="flex bg-slate-200/50 p-1 rounded-md mb-4">
                <button type="button" className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded ${editingTx.type === 'EXPENSE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => setEditingTx({...editingTx, type: 'EXPENSE'})}>Egreso</button>
                <button type="button" className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded ${editingTx.type === 'INCOME' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => setEditingTx({...editingTx, type: 'INCOME'})}>Ingreso</button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Monto ($)</label>
                <input type="number" step="0.01" inputMode="decimal" required className="w-full p-3 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-lg font-light transition-colors text-slate-900" value={editingTx.amount} onChange={(e) => setEditingTx({...editingTx, amount: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Fecha</label>
                <input type="date" required className="w-full p-3 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900" value={editingTx.date} onChange={(e) => setEditingTx({...editingTx, date: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Concepto</label>
                <input type="text" required className="w-full p-3 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900" value={editingTx.concept} onChange={(e) => setEditingTx({...editingTx, concept: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Clasificación</label>
                <select required className="w-full p-3 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900 appearance-none" value={editingTx.category} onChange={(e) => setEditingTx({...editingTx, category: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {dbCategories.filter(c => c.type === editingTx.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Periodo</label>
                  <select className="w-full p-3 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900 appearance-none" value={editingTx.frequency} onChange={(e) => setEditingTx({...editingTx, frequency: e.target.value})}>
                    <option value="DIA">Día a Día</option>
                    <option value="SEMANA">Semanal</option>
                    <option value="MES">Mensual</option>
                    <option value="AÑO">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Pago</label>
                  <select className="w-full p-3 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900 appearance-none" value={editingTx.payment_method} onChange={(e) => setEditingTx({...editingTx, payment_method: e.target.value})}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-slate-900 text-white font-semibold tracking-wide uppercase text-sm rounded-lg hover:bg-slate-800 transition-colors">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
