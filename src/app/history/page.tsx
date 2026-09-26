'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      let query = supabase.from('transactions').select('*').order('date', { ascending: false });
      if (filter !== 'ALL') query = query.eq('type', filter);
      const { data, error } = await query;
      if (error) throw error;
      if (data) setTransactions(data);
    } catch(e) {
       let mock = [
         { id: '1', concept: 'Venta del día', category: 'Ventas', type: 'INCOME', amount: 450, date: new Date().toISOString(), payment_method: 'EFECTIVO' },
         { id: '2', concept: 'Pago de basura', category: 'Servicios', type: 'EXPENSE', amount: 50, date: new Date().toISOString(), payment_method: 'EFECTIVO' }
       ];
       if (filter !== 'ALL') mock = mock.filter(m => m.type === filter);
       setTransactions(mock);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
        fetchTransactions();
      } catch(e) {
        alert('Modo local (Sin BD conectada): Registro simulado borrado.');
      }
    }
  };

  const exportCSV = () => {
    const headers = ['Fecha,Tipo,Monto,Concepto,Categoria,Metodo_Pago\n'];
    const csvContent = transactions.map(t => {
      return `${new Date(t.date).toISOString().split('T')[0]},${t.type},${t.amount},"${t.concept}","${t.category}",${t.payment_method}`;
    }).join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'historial_finanzas.csv');
    a.click();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historial</h1>
        <button onClick={exportCSV} className="text-blue-600 flex items-center text-sm font-medium">
          <Download size={16} className="mr-1" /> CSV
        </button>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALL', 'INCOME', 'EXPENSE'].map(f => (
          <button 
            key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {f === 'ALL' ? 'Todos' : f === 'INCOME' ? 'Ingresos' : 'Gastos'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex-1">
              <p className="font-semibold text-sm">{t.concept}</p>
              <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.payment_method}</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <p className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
              </p>
              <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
