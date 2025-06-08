import { Home as HomeIcon, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-100 p-6 flex flex-col justify-between fixed h-full">
      <div>
        {/* App Logo */}
        <div className="mb-12 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-green-400 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-green-500 text-transparent bg-clip-text">
            Eco Tunga
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-4 py-3 text-lg rounded-xl hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all duration-200 hover:shadow-sm group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-teal-100/50 transition-all">
              <HomeIcon size={20} className="text-gray-500 group-hover:text-teal-600" />
            </div>
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-4 px-4 py-3 text-lg rounded-xl hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all duration-200 hover:shadow-sm group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-teal-100/50 transition-all">
              <User size={20} className="text-gray-500 group-hover:text-teal-600" />
            </div>
            <span className="font-medium">Profile</span>
          </button>
          <button
            onClick={() => navigate('/users')}
            className="w-full flex items-center gap-4 px-4 py-3 text-lg rounded-xl hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all duration-200 hover:shadow-sm group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-teal-100/50 transition-all">
              <User size={20} className="text-gray-500 group-hover:text-teal-600" />
            </div>
            <span className="font-medium">Users</span>
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-6 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-lg rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-red-100/50 transition-all">
            <LogOut size={20} />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}