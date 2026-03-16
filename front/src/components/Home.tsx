// src/pages/Home.tsx con Tailwind
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">¡Bienvenido!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Esta es la página de inicio. Estás probando las rutas y los estilos con Tailwind CSS.
        </p>
        <Link
          to="/about" // Cambia esta ruta según tu configuración
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir a Acerca de
        </Link>
        <Link
            to="/registro"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;