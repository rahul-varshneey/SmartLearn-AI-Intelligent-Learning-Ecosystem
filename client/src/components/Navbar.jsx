import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpenIcon, ChartBarIcon, ChatBubbleLeftEllipsisIcon, DocumentArrowUpIcon, RectangleStackIcon, FireIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="p-4 bg-gray-800 border-b border-gray-700 shadow-xl flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:opacity-80 transition-opacity flex items-center gap-2">
        <BookOpenIcon className="h-8 w-8 text-blue-400" />
        SmartLearn AI
      </Link>
      
      {user ? (
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-300 hover:text-white flex items-center gap-1 transition-colors">
            <DocumentArrowUpIcon className="h-5 w-5" /> Documents
          </Link>
          <Link to="/analytics" className="text-gray-300 hover:text-white flex items-center gap-1 transition-colors">
            <ChartBarIcon className="h-5 w-5" /> Analytics
          </Link>
          <div className="flex items-center gap-4 border-l border-gray-600 pl-4">
            <span className="text-sm font-semibold text-gray-400">Hey, {user.name}</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-700 hover:bg-red-600/80 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 text-gray-300 hover:text-white font-medium transition-colors">Login</Link>
          <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">Start Learning</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
