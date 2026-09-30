'use client'

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, Upload, X, Edit2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [editingTx, setEditingTx] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    a.setAttribute('download', 'Plantilla_Reporte_Operaciones.csv');
    a.click();
    toast.success("Plantilla exportada");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const toastId = toast.loading("Leyendo archivo...");
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          return toast.error("El archivo está vacío o no tiene el formato correcto", { id: toastId });
        }

        const formattedTxs = data.map((row: any) => {
          let dateStr = row.Fecha || row.fecha || row.Date || row.date;
          if (typeof dateStr === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            dateStr = new Date(excelEpoch.getTime() + dateStr * 86400000).toISOString();
          } else {
            const stringDate = dateStr || new Date().toISOString().split('T')[0];
            // Format to ensure compatibility
            dateStr = new Date(stringDate + (stringDate.includes('T') ? '' : 'T12:00:00Z')).toISOString();
          }

          let rawType = (row.Tipo || row.tipo || row.Type || row.type || 'EXPENSE').toString().toUpperCase();
          let parsedType = 'EXPENSE';
          if (rawType.includes('INCOME') || rawType.includes('INGRESO')) parsedType = 'INCOME';
          if (rawType.includes('RECEIVABLE') || rawType.includes('COBRAR')) parsedType = 'RECEIVABLE';

          return {
            type: parsedType,
            amount: parseFloat(row.Monto || row.monto || row.Amount || row.amount) || 0,
            concept: (row.Concepto || row.concepto || row.Concept || row.concept || 'Importación Masiva').toString(),
            category: (row.Categoria || row.categoria || row.Category || row.category || 'General').toString(),
            payment_method: (row.Metodo_Pago || row.Metodo || row.Payment || 'EFECTIVO').toString().toUpperCase(),
            frequency: (row.Frecuencia || row.frecuencia || row.Frequency || 'DIA').toString().toUpperCase(),
            date: dateStr
          };
        });

        // Batch insert
        const { error } = await supabase.from('transactions').insert(formattedTxs);
        if (error) throw error;
        
        toast.success(`¡${formattedTxs.length} registros cargados con éxito!`, { id: toastId });
        fetchTransactions();
      } catch (err: any) {
        toast.error("Error procesando Excel: " + err.message, { id: toastId });
      }
      
      // Reset input so they can upload the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 px-6 py-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Libro Mayor</h1>
        
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport}
          />
          <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <Upload size={14} strokeWidth={2.5} /> Subir
          </button>
          
          <button onClick={exportCSV} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-900 transition-colors">
            <Download size={14} strokeWidth={2.5} /> Bajar
          </button>
        </div>
      </div>

      <div className="px-6 mt-6">
        <div className="flex bg-slate-200/50 p-1 rounded-md mb-8">
          {['ALL', 'INCOME', 'EXPENSE', 'RECEIVABLE'].map(f => (
            <button 
              key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest transition-colors rounded ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f === 'ALL' ? 'Todo' : f === 'INCOME' ? 'Ingresos' : f === 'EXPENSE' ? 'Gastos' : 'X Cobrar'}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {transactions.map((t, idx) => {
            const isIncome = t.type === 'INCOME';
            const isReceivable = t.type === 'RECEIVABLE';
            return (
              <div key={t.id} className={`flex justify-between items-center p-4 ${idx !== transactions.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isReceivable && <Clock size={12} className="text-amber-500" strokeWidth={3} />}
                    <p className="font-semibold text-slate-900 text-sm">{t.concept}</p>
                    {t.frequency && t.frequency !== 'DIA' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">{t.frequency}</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-medium">
                    {new Date(t.date).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })} • {t.category}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className={`font-medium ${isIncome ? 'text-emerald-600' : isReceivable ? 'text-amber-600' : 'text-slate-900'}`}>
                    {isIncome ? '+' : isReceivable ? '' : '-'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                <button type="button" className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors rounded ${editingTx.type === 'EXPENSE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => setEditingTx({...editingTx, type: 'EXPENSE'})}>Egreso</button>
                <button type="button" className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors rounded ${editingTx.type === 'INCOME' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => setEditingTx({...editingTx, type: 'INCOME'})}>Ingreso</button>
                <button type="button" className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors rounded ${editingTx.type === 'RECEIVABLE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => setEditingTx({...editingTx, type: 'RECEIVABLE'})}>X Cobrar</button>
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
