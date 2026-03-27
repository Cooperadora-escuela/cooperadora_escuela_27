// src/components/Avatar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contex/UserContex';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Avatar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // Llama a la función del contexto
    toast.success('Sesión cerrada correctamente');
    navigate('/'); // Redirige a la raíz
    setIsOpen(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = () => {
    const first = user.nombre?.charAt(0) || '';
    const last = user.apellido?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
            <p className="font-medium">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <Link
            to="/perfil"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default Avatar;