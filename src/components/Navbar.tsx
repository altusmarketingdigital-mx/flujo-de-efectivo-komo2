'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, List, Settings } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-slate-200 left-0 right-0 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className={`flex flex-col items-center transition-colors ${pathname === '/' ? 'text-slate-900' : 'text-slate-400'}`}>
          <Home size={20} strokeWidth={pathname === '/' ? 2.5 : 1.5} />
          <span className="text-[10px] mt-1.5 font-medium tracking-wide">RESUMEN</span>
        </Link>
        
        <Link href="/capture" className={`flex flex-col items-center transition-colors ${pathname === '/capture' ? 'text-slate-900' : 'text-slate-400'}`}>
          <PlusSquare size={20} strokeWidth={pathname === '/capture' ? 2.5 : 1.5} />
          <span className="text-[10px] mt-1.5 font-medium tracking-wide">CAPTURAR</span>
        </Link>
        
        <Link href="/history" className={`flex flex-col items-center transition-colors ${pathname === '/history' ? 'text-slate-900' : 'text-slate-400'}`}>
          <List size={20} strokeWidth={pathname === '/history' ? 2.5 : 1.5} />
          <span className="text-[10px] mt-1.5 font-medium tracking-wide">HISTORIAL</span>
        </Link>

        <Link href="/settings" className={`flex flex-col items-center transition-colors ${pathname === '/settings' ? 'text-slate-900' : 'text-slate-400'}`}>
          <Settings size={20} strokeWidth={pathname === '/settings' ? 2.5 : 1.5} />
          <span className="text-[10px] mt-1.5 font-medium tracking-wide">AJUSTES</span>
        </Link>
      </div>
    </nav>
  );
}
