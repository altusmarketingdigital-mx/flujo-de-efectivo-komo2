'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, List, Settings } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-200 left-0 right-0 z-50">
      <div className="flex justify-around items-center h-16 px-1">
        <Link href="/" className={`flex flex-col items-center ${pathname === '/' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Home size={22} />
          <span className="text-[10px] mt-1 font-medium">Inicio</span>
        </Link>
        
        <Link href="/capture" className={`flex flex-col items-center ${pathname === '/capture' ? 'text-blue-600' : 'text-gray-500'}`}>
          <div className="bg-blue-600 text-white p-3 rounded-full absolute -top-6 shadow-lg shadow-blue-500/30 border-4 border-white">
            <PlusCircle size={24} />
          </div>
        </Link>
        
        <Link href="/history" className={`flex flex-col items-center ${pathname === '/history' ? 'text-blue-600' : 'text-gray-500'}`}>
          <List size={22} />
          <span className="text-[10px] mt-1 font-medium">Historial</span>
        </Link>

        <Link href="/settings" className={`flex flex-col items-center ${pathname === '/settings' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Settings size={22} />
          <span className="text-[10px] mt-1 font-medium">Categorías</span>
        </Link>
      </div>
    </nav>
  );
}
