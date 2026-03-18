// src/components/Header.tsx
import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Título */}
        <Link to="/" className="text-xl font-bold text-purple-600">
          Mi App
        </Link>

        {/* Enlaces de navegación */}
        <div className="flex space-x-4">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/registro"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Registro
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Login
          </NavLink>
        </div>

        {/* Avatar placeholder (se reemplazará después) */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
          U
        </div>
      </nav>
    </header>
  );
};

export default Header;