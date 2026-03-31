// src/components/HeaderForms.tsx
import React from 'react';

interface HeaderFormsProps {
  subtitulo?: string;
}

const HeaderForms: React.FC<HeaderFormsProps> = ({ subtitulo = 'Acceso para miembros de la cooperadora' }) => {
  return (
    <div className="w-full text-center mb-8">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">
        Cooperadora Escuela 27 de 4. Dean Funes
      </h1>
      <p className="text-gray-600 mt-2">{subtitulo}</p>
      <div className="w-full h-0.5 bg-purple-300 mt-4"></div>
    </div>
  );
};

export default HeaderForms;