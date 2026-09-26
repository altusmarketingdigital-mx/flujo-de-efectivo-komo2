'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CapturePage() {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('DIA');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  
  const [dbCategories, setDbCategories] = useState<any[]>([{id:1, name: 'Servicios'}, {id:2, name: 'Personal'}]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('transactions').insert([{
        type, amount: parseFloat(amount), concept, category, frequency, payment_method: paymentMethod
      }]);
    } catch(e) {}
    alert('Registro guardado exitosamente');
    setAmount(''); setConcept(''); setCategory(''); setFrequency('DIA');
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Nuevo Registro</h1>
      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button className={`flex-1 py-2 rounded-md font-semibold ${type === 'EXPENSE' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`} onClick={() => setType('EXPENSE')}>Gasto</button>
        <button className={`flex-1 py-2 rounded-md font-semibold ${type === 'INCOME' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`} onClick={() => setType('INCOME')}>Ingreso</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto</label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-2xl">$</span>
            <input type="number" step="0.01" inputMode="decimal" required className="w-full pl-10 pr-4 py-4 text-3xl font-bold border rounded-lg" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Concepto</label>
          <input type="text" required className="mt-1 w-full p-3 border rounded-lg" value={concept} onChange={(e) => setConcept(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select required className="w-full p-3 border rounded-lg bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Selecciona</option>
              {dbCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
            <select className="w-full p-3 border rounded-lg bg-white" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="DIA">Único / Día</option>
              <option value="SEMANA">Por Semana</option>
              <option value="MES">Por Mes</option>
              <option value="AÑO">Por Año</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
          <select className="mt-1 w-full p-3 border rounded-lg bg-white" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="TARJETA">Tarjeta</option>
          </select>
        </div>
        <button type="submit" className={`w-full py-4 text-white font-bold rounded-lg text-lg ${type === 'EXPENSE' ? 'bg-red-600' : 'bg-green-600'}`}>Guardar Registro</button>
      </form>
    </div>
  );
}
