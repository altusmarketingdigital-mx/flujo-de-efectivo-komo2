'use client'
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'komo2024') {
      document.cookie = "komo_auth=true; path=/; max-age=31536000"; // Expires in 1 year
      window.location.href = '/';
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-light text-slate-900 tracking-wide">Acceso Privado</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Sistema Financiero</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Usuario</label>
            <input 
              type="text" required 
              className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-xl text-sm transition-colors text-slate-900 font-medium" 
              placeholder="Ingresa tu usuario"
              value={user} onChange={(e) => setUser(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
            <input 
              type="password" required 
              className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-0 rounded-xl text-sm transition-colors text-slate-900 font-medium" 
              placeholder="••••••••"
              value={pass} onChange={(e) => setPass(e.target.value)} 
            />
          </div>

          <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold tracking-widest uppercase text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
