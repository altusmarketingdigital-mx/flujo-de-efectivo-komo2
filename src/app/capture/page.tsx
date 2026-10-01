'use client'
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CapturePage() {
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'RECEIVABLE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('DIA');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('type', type);
    if (data) setDbCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !concept || !category || !date) return toast.error("Información incompleta");
    
    const toastId = toast.loading('Procesando...');
    const fullDate = new Date(date + 'T12:00:00Z').toISOString();

    const { error } = await supabase.from('transactions').insert([{
      type, amount: parseFloat(amount), concept, category, frequency, payment_method: paymentMethod, date: fullDate
    }]);

    if (error) {
      toast.error('Error de sistema: ' + error.message, { id: toastId });
    } else {
      toast.success('Entrada registrada', { id: toastId });
      setAmount(''); 
      setConcept(''); 
      setCategory(''); 
      setFrequency('DIA');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const toastId = toast.loading("Leyendo archivo Excel...");
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          toast.dismiss(toastId);
          return toast.error("El archivo está vacío o no tiene el formato correcto");
        }

        const formattedTxs = data.map((row: any) => {
          let dateStr = row.Fecha || row.fecha || row.Date || row.date;
          let parsedDate;

          if (typeof dateStr === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            parsedDate = new Date(excelEpoch.getTime() + dateStr * 86400000);
          } else {
            const stringDate = String(dateStr || new Date().toISOString().split('T')[0]).trim();
            // Si ya viene con formato ISO o asimilable
            parsedDate = new Date(stringDate + (stringDate.includes('T') ? '' : 'T12:00:00Z'));
            
            // Si el Date nativo falló, intentamos parsear formato DD/MM/YYYY o DD-MM-YYYY
            if (isNaN(parsedDate.getTime())) {
              const parts = stringDate.split(/[\/\-]/);
              if (parts.length === 3) {
                // Asumimos formato latinoamericano DD/MM/YYYY
                let day = parts[0];
                let month = parts[1];
                let year = parts[2];
                
                // Si el año viene al principio (YYYY/MM/DD)
                if (parts[0].length === 4) {
                  year = parts[0];
                  month = parts[1];
                  day = parts[2];
                }
                
                parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
              }
            }
          }

          // Si de plano fue imposible parsear la fecha, usamos la fecha de hoy
          if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date();
          }

          const finalIsoDate = parsedDate.toISOString();
          const parsedType = 'EXPENSE';

          return {
            type: parsedType,
            amount: parseFloat(row.Monto || row.monto || row.Amount || row.amount) || 0,
            concept: (row.Concepto || row.concepto || row.Concept || row.concept || 'Importación Masiva').toString(),
            category: (row.Categoria || row.categoria || row.Category || row.category || 'General').toString(),
            payment_method: (row.Metodo_Pago || row.Metodo || row.Payment || 'EFECTIVO').toString().toUpperCase(),
            frequency: (row.Frecuencia || row.frecuencia || row.Frequency || 'DIA').toString().toUpperCase(),
            date: finalIsoDate
          };
        });

        toast.dismiss(toastId);
        setPreviewData(formattedTxs);
        
      } catch (err: any) {
        toast.dismiss(toastId);
        toast.error("Error procesando Excel: " + err.message);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const processBulkImport = async () => {
    if (!previewData) return;
    const toastId = toast.loading('Guardando registros en la nube...');
    try {
      const { error } = await supabase.from('transactions').insert(previewData);
      if (error) throw error;
      
      toast.success(`¡${previewData.length} gastos importados con éxito!`, { id: toastId });
      setPreviewData(null);
    } catch (error: any) {
      toast.error('Error al guardar: ' + error.message, { id: toastId });
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
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded ${type === 'EXPENSE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} 
            onClick={() => setType('EXPENSE')}
          >
            Egreso
          </button>
          <button 
            type="button" 
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded ${type === 'INCOME' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} 
            onClick={() => setType('INCOME')}
          >
            Ingreso
          </button>
          <button 
            type="button" 
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded ${type === 'RECEIVABLE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} 
            onClick={() => setType('RECEIVABLE')}
          >
            X Cobrar
          </button>
        </div>

        {/* BULK UPLOAD BUTTON - ONLY VISIBLE ON EXPENSES */}
        {type === 'EXPENSE' && (
          <div className="mb-6 bg-slate-100 rounded-xl p-4 border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">Carga Masiva</p>
              <p className="text-[10px] text-slate-500">Sube múltiples gastos desde Excel</p>
            </div>
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()} 
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <Upload size={14} /> Subir Archivo
            </button>
          </div>
        )}

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
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Fecha del Movimiento</label>
                <input 
                  type="date" required 
                  className="w-full p-4 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900" 
                  value={date} onChange={(e) => setDate(e.target.value)} 
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Concepto</label>
                <input 
                  type="text" required 
                  className="w-full p-4 bg-white border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg text-sm transition-colors text-slate-900" 
                  placeholder="Ej. Nómina, Factura #102..."
                  value={concept} onChange={(e) => setConcept(e.target.value)} 
                />
              </div>

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

      {/* PREVIEW MODAL */}
      {previewData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Validación de Datos</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Revisión previa a la carga</p>
              </div>
              <button onClick={() => setPreviewData(null)} className="text-slate-400 hover:text-slate-900 p-2 bg-slate-200 rounded-full transition-colors">
                <X size={16} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Registros Leídos</p>
                  <p className="text-2xl font-light text-emerald-900">{previewData.length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total ($)</p>
                  <p className="text-xl font-light text-slate-900">${previewData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vista Previa (Primeros 3)</h3>
              <div className="space-y-3">
                {previewData.slice(0, 3).map((row, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{row.concept}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{row.category} • {row.date.split('T')[0]}</p>
                    </div>
                    <p className="text-sm font-bold text-rose-600">-${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
                {previewData.length > 3 && (
                  <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                    ... y {previewData.length - 3} registros más.
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                onClick={processBulkImport}
                className="w-full py-4 bg-emerald-600 text-white font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 size={18} /> Procesar {previewData.length} Gastos
              </button>
              <button 
                onClick={() => setPreviewData(null)}
                className="w-full py-3 mt-3 text-slate-500 font-bold tracking-widest uppercase text-[10px] rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar Carga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
