// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Cooperadora Escolar
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Conectando a la comunidad educativa: información, eventos y gestión para padres y cooperadora.
        </p>
      </section>

      {/* Tarjetas de características */}
      <section className="container mx-auto px-4 pb-16 grid md:grid-cols-2 gap-8 max-w-5xl">
        {/* Sección Padres */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
          <div className="text-purple-600 text-5xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Para Padres</h2>
          <p className="text-gray-600 mb-6">
            Accedé a noticias, eventos escolares, calendario académico y documentos importantes. Todo en un solo lugar.
          </p>
          <Link
            to="/noticias" // Ruta placeholder (aún no implementada)
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Explorar
          </Link>
        </div>

        {/* Sección Cooperadora */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
          <div className="text-purple-600 text-5xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Área Administrativa</h2>
          <p className="text-gray-600 mb-6">
            Gestioná contenidos, publicá noticias, administrá eventos y documentos. Acceso exclusivo para miembros.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Acceder
          </Link>
        </div>
      </section>

      {/* Llamado a la acción opcional */}
      <section className="text-center pb-16">
        <p className="text-gray-500">
          ¿Sos parte de la cooperadora? <Link to="/registro" className="text-purple-600 hover:underline">Solicitá tu cuenta</Link>
        </p>
      </section>
    </div>
  );
};

export default Home;