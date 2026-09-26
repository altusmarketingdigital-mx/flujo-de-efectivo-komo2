import Link from 'next/link';
import { Home, PlusCircle, List } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-200 left-0 right-0 z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Home size={24} />
          <span className="text-xs mt-1">Inicio</span>
        </Link>
        <Link href="/capture" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <div className="bg-blue-600 text-white p-3 rounded-full -mt-6 shadow-lg">
            <PlusCircle size={28} />
          </div>
        </Link>
        <Link href="/history" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <List size={24} />
          <span className="text-xs mt-1">Historial</span>
        </Link>
      </div>
    </nav>
  );
}
