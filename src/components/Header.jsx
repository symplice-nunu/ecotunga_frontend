import { Menu, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <button className="mr-4 p-2 rounded-lg hover:bg-gray-100 md:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
          <User size={20} className="text-teal-600" />
        </div>
      </div>
    </header>
  );
}