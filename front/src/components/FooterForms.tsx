// src/components/FooterForms.tsx
import React from 'react';

const FooterForms: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-8 pt-4 border-t border-purple-200 text-center text-gray-500 text-sm">
      <p>© {currentYear} Cooperadora Escuela 27 de 4. Dean Funes</p>
      <p className="mt-1">Todos los derechos reservados</p>
    </footer>
  );
};

export default FooterForms;