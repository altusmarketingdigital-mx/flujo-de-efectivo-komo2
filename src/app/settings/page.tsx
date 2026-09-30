'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function SettingsPage() {
  const [expenseCats, setExpenseCats] = useState<any[]>([]);
  const [incomeCats, setIncomeCats] = useState<any[]>([]);
  const [recCats, setRecCats] = useState<any[]>([]);
  
  const [newExp, setNewExp] = useState('');
  const [newInc, setNewInc] = useState('');
  const [newRec, setNewRec] = useState('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'URL NO ENCONTRADA';

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) {
      setExpenseCats(data.filter(c => c.type === 'EXPENSE'));
      setIncomeCats(data.filter(c => c.type === 'INCOME'));
      setRecCats(data.filter(c => c.type === 'RECEIVABLE'));
    }
  };

  const addCat = async (type: string, name: string, setInput: any) => {
    if (!name.trim()) return;
    const { error } = await supabase.from('categories').insert([{ type, name }]);
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Categoría registrada");
      setInput('');
      fetchCats();
    }
  };

  const delCat = async (id: string) => {
    if (confirm('¿Confirmas la eliminación de esta categoría?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) toast.error("Error al eliminar: " + error.message);
      else {
        toast.success("Categoría eliminada");
        fetchCats();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <h1 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-center">Clasificaciones</h1>
      </div>
      
      <div className="px-6 mt-6">
        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Centro de Costos (Egresos)</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Ej. Proveedores..." className="flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-0 transition-colors" value={newExp} onChange={e => setNewExp(e.target.value)} />
            <button onClick={() => addCat('EXPENSE', newExp, setNewExp)} className="px-5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">Añadir</button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {expenseCats.map((c, idx) => (
              <div key={c.id} className={`flex justify-between items-center p-3.5 ${idx !== expenseCats.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <span className="text-sm font-medium text-slate-700">{c.name}</span>
                <button onClick={() => delCat(c.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={16} strokeWidth={2.5}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Fuentes de Ingreso</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Ej. Facturación..." className="flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-0 transition-colors" value={newInc} onChange={e => setNewInc(e.target.value)} />
            <button onClick={() => addCat('INCOME', newInc, setNewInc)} className="px-5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">Añadir</button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {incomeCats.map((c, idx) => (
              <div key={c.id} className={`flex justify-between items-center p-3.5 ${idx !== incomeCats.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <span className="text-sm font-medium text-slate-700">{c.name}</span>
                <button onClick={() => delCat(c.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={16} strokeWidth={2.5}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">Pedidos X Cobrar</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Ej. Clientes Corporativos..." className="flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-0 transition-colors" value={newRec} onChange={e => setNewRec(e.target.value)} />
            <button onClick={() => addCat('RECEIVABLE', newRec, setNewRec)} className="px-5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">Añadir</button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {recCats.map((c, idx) => (
              <div key={c.id} className={`flex justify-between items-center p-3.5 ${idx !== recCats.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <span className="text-sm font-medium text-slate-700">{c.name}</span>
                <button onClick={() => delCat(c.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={16} strokeWidth={2.5}/></button>
              </div>
            ))}
            {recCats.length === 0 && (
              <div className="text-center py-4 text-slate-400 text-[10px] uppercase tracking-widest">
                Sin categorías agregadas
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 text-center">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Diagnóstico de Conexión</p>
          <p className="text-[10px] text-slate-500 break-all bg-slate-200/50 p-2 rounded">{supabaseUrl}</p>
        </div>
      </div>
    </div>
  );
}
