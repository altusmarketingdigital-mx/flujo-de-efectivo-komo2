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
    const { data } = await supabase.from('categories').select('*').eq('type', type);
    if (data) setDbCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !concept || !category) return toast.error("Información incompleta");
    
    const toastId = toast.loading('Procesando...');
    const { error } = await supabase.from('transactions').insert([{
      type, amount: parseFloat(amount), concept, category, frequency, payment_method: paymentMethod
    }]);

    if (error) {
      toast.error('Error de sistema: ' + error.message, { id: toastId });
    } else {
      toast.success('Entrada registrada', { id: toastId });
      setAmount(''); setConcept(''); setCategory(''); setFrequency('DIA');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <h1 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-center">Registro de Flujo</h1>
      </div>
      
      <div className="px-6 mt-6">
        <div className="flex bg-slate-200/50 p-1 rounded-md mb-8">
          <button 
            type="button" 
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors rounded ${type === 'EXPENSE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} 
            onClick={() => setType('EXPENSE')}
          >
            Egreso
          </button>
          <button 
            type="button" 
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors rounded ${type === 'INCOME' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} 
            onClick={() => setType('INCOME')}
          >
            Ingreso
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monto de Operación</label>
            <div className="flex items-end text-3xl font-light text-slate-900 border-b border-slate-200 pb-2 focus-within:border-slate-900 transition-colors">
              <span className="text-slate-400 mr-2 pb-1">$</span>
              <input 
                type="number" step="0.01" inputMode="decimal" required 
                className="bg-transparent border-none outline-none w-full p-0 focus:ring-0" 
                placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Concepto</label>
              <input 
                type="text" required 
                className="w-full p-4 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900" 
                placeholder="Ej. Nómina, Factura #102..."
                value={concept} onChange={(e) => setConcept(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Clasificación</label>
                <select required className="w-full p-4 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900 appearance-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {dbCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Periodo</label>
                <select className="w-full p-4 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900 appearance-none" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option value="DIA">Día a Día</option>
                  <option value="SEMANA">Semanal</option>
                  <option value="MES">Mensual</option>
                  <option value="AÑO">Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Canal de Pago</label>
              <select className="w-full p-4 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900 appearance-none" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="TARJETA">Tarjeta de Crédito/Débito</option>
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-semibold tracking-wide uppercase text-sm rounded-lg hover:bg-slate-800 transition-colors">
              Autorizar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
