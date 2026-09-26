'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function CapturePage() {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('DIA');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').eq('type', type);
    if (data) setDbCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !concept || !category) return toast.error("Completa los campos requeridos");
    
    const toastId = toast.loading('Guardando...');
    const { data, error } = await supabase.from('transactions').insert([{
      type, amount: parseFloat(amount), concept, category, frequency, payment_method: paymentMethod
    }]);

    if (error) {
      toast.error('Error al guardar: ' + error.message, { id: toastId });
    } else {
      toast.success('¡Registro guardado con éxito!', { id: toastId });
      setAmount(''); setConcept(''); setCategory(''); setFrequency('DIA');
    }
  };

  return (
    <div className="p-5 pb-24 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-6 text-center">Nuevo Registro</h1>
      
      {/* Toggle Ingreso / Gasto */}
      <div className="flex bg-gray-200/80 p-1.5 rounded-xl mb-8 backdrop-blur-sm shadow-inner">
        <button 
          type="button" 
          className={`flex-1 py-3 rounded-lg font-bold transition-all text-sm ${type === 'EXPENSE' ? 'bg-white shadow text-red-600 scale-100' : 'text-gray-500 hover:text-gray-700 scale-95'}`} 
          onClick={() => setType('EXPENSE')}
        >
          Salida
        </button>
        <button 
          type="button" 
          className={`flex-1 py-3 rounded-lg font-bold transition-all text-sm ${type === 'INCOME' ? 'bg-white shadow text-green-600 scale-100' : 'text-gray-500 hover:text-gray-700 scale-95'}`} 
          onClick={() => setType('INCOME')}
        >
          Entrada
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        
        {/* Monto Centralizado */}
        <div className="text-center pb-4 border-b border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Monto Total</label>
          <div className="flex items-center justify-center text-4xl font-black text-gray-900">
            <span className="text-gray-300 mr-1">$</span>
            <input 
              type="number" step="0.01" inputMode="decimal" required 
              className="bg-transparent border-none outline-none text-center w-full max-w-[200px] placeholder-gray-200 p-0 focus:ring-0" 
              placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)} 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Concepto / Nombre</label>
          <input 
            type="text" required 
            className="w-full p-3.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-xl transition-all text-gray-900 font-medium" 
            placeholder="Ej. Compra de insumos..."
            value={concept} onChange={(e) => setConcept(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría</label>
            <select required className="w-full p-3.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-xl transition-all text-gray-900 font-medium appearance-none" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="" className="text-gray-400">Elige...</option>
              {dbCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Frecuencia</label>
            <select className="w-full p-3.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-xl transition-all text-gray-900 font-medium appearance-none" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="DIA">Única vez</option>
              <option value="SEMANA">Semanal</option>
              <option value="MES">Mensual</option>
              <option value="AÑO">Anual</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Método de Pago</label>
          <select className="w-full p-3.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-xl transition-all text-gray-900 font-medium appearance-none" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="EFECTIVO">Efectivo 💵</option>
            <option value="TRANSFERENCIA">Transferencia 🏦</option>
            <option value="TARJETA">Tarjeta 💳</option>
          </select>
        </div>

        <div className="pt-4">
          <button type="submit" className={`w-full py-4 text-white font-black rounded-2xl text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all ${type === 'EXPENSE' ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-red-500/30' : 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-green-500/30'}`}>
            Confirmar {type === 'EXPENSE' ? 'Gasto' : 'Ingreso'}
          </button>
        </div>
      </form>
    </div>
  );
}
