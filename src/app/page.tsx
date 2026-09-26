import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0;

export default async function Home() {
  let data = null;
  
  try {
    const res = await supabase.from('transactions').select('*').order('date', { ascending: false });
    data = res.data;
  } catch (e) {
    console.log('Modo local');
  }

  let income = 0;
  let expense = 0;

  if (data && data.length > 0) {
    data.forEach((t: any) => {
      if (t.type === 'INCOME') income += Number(t.amount);
      if (t.type === 'EXPENSE') expense += Number(t.amount);
    });
  } else {
    data = [
      { id: '1', concept: 'Venta del día', category: 'Ventas', type: 'INCOME', amount: 450, date: new Date().toISOString() },
      { id: '2', concept: 'Pago de basura', category: 'Servicios', type: 'EXPENSE', amount: 50, date: new Date().toISOString() }
    ];
    income = 450;
    expense = 50;
  }

  const balance = income - expense;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Resumen Financiero</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm text-green-600 font-medium">Ingresos</p>
          <p className="text-xl font-bold text-green-700">${income.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm text-red-600 font-medium">Gastos</p>
          <p className="text-xl font-bold text-red-700">${expense.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-blue-600 p-6 rounded-xl text-white mb-8 shadow-lg">
        <p className="text-blue-100 font-medium mb-1">Balance Neto</p>
        <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Últimos Movimientos</h2>
      <div className="space-y-3">
        {data.slice(0, 5).map((t: any) => (
          <div key={t.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
            <div>
              <p className="font-semibold">{t.concept}</p>
              <p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
            </div>
            <p className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
