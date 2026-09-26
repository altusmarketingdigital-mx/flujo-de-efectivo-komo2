'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const [expenseCats, setExpenseCats] = useState<any[]>([]);
  const [incomeCats, setIncomeCats] = useState<any[]>([]);
  const [newExp, setNewExp] = useState('');
  const [newInc, setNewInc] = useState('');

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) {
      setExpenseCats(data.filter(c => c.type === 'EXPENSE'));
      setIncomeCats(data.filter(c => c.type === 'INCOME'));
    }
  };

  const addCat = async (type: string, name: string, setInput: any) => {
    if (!name.trim()) return;
    await supabase.from('categories').insert([{ type, name }]);
    setInput('');
    fetchCats();
  };

  const delCat = async (id: string) => {
    if (confirm('¿Eliminar categoría?')) {
      await supabase.from('categories').delete().eq('id', id);
      fetchCats();
    }
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>
      <p className="text-sm text-gray-500 mb-6">Administra las categorías disponibles al capturar registros.</p>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Gastos</h2>
        <div className="flex gap-2 mb-3">
          <input type="text" placeholder="Añadir gasto..." className="flex-1 p-2 text-sm border rounded-lg" value={newExp} onChange={e => setNewExp(e.target.value)} />
          <button onClick={() => addCat('EXPENSE', newExp, setNewExp)} className="px-4 bg-red-600 text-white rounded-lg text-sm font-bold">+</button>
        </div>
        <ul className="space-y-2">
          {expenseCats.map(c => (
            <li key={c.id} className="flex justify-between items-center bg-white border p-2 rounded-lg shadow-sm">
              <span className="text-sm font-medium">{c.name}</span>
              <button onClick={() => delCat(c.id)} className="text-red-500 text-sm font-bold px-2 hover:bg-red-50 rounded">✕</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-green-600 mb-2">Ingresos</h2>
        <div className="flex gap-2 mb-3">
          <input type="text" placeholder="Añadir ingreso..." className="flex-1 p-2 text-sm border rounded-lg" value={newInc} onChange={e => setNewInc(e.target.value)} />
          <button onClick={() => addCat('INCOME', newInc, setNewInc)} className="px-4 bg-green-600 text-white rounded-lg text-sm font-bold">+</button>
        </div>
        <ul className="space-y-2">
          {incomeCats.map(c => (
            <li key={c.id} className="flex justify-between items-center bg-white border p-2 rounded-lg shadow-sm">
              <span className="text-sm font-medium">{c.name}</span>
              <button onClick={() => delCat(c.id)} className="text-red-500 text-sm font-bold px-2 hover:bg-red-50 rounded">✕</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
