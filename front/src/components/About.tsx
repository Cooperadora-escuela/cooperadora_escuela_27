// src/pages/About.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-pink-100 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
          Acerca de
        </h1>
        <div className="w-24 h-1 bg-cyan-500 mx-auto mb-6 rounded-full"></div>
        
        <p className="text-lg text-gray-600 text-center mb-6">
          Esta es la página "Acerca de". Puedes usarla para probar la navegación y los estilos con Tailwind CSS.
        </p>
        
        <div className="flex justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;