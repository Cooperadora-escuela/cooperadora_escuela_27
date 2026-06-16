import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config';

interface TenantContextType {
  slug: string;
  nombre: string;
  numeroEscuela: number | null;
}

const TenantContext = createContext<TenantContextType>({ slug: '', nombre: '', numeroEscuela: null });

export const useTenant = (): TenantContextType => useContext(TenantContext);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [nombre, setNombre] = useState('');
  const [numeroEscuela, setNumeroEscuela] = useState<number | null>(null);

  const slug = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (!parts[0] || parts[0] === 'register') return '';
    return parts[0];
  }, [pathname]);

  useEffect(() => {
    if (!slug) { setNombre(''); setNumeroEscuela(null); return; }
    fetch(`${API_URL}/api/cooperadora-info/${slug}/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setNombre(data?.nombre ?? '');
        setNumeroEscuela(data?.numero_escuela ?? null);
      })
      .catch(() => { setNombre(''); setNumeroEscuela(null); });
  }, [slug]);

  return (
    <TenantContext.Provider value={{ slug, nombre, numeroEscuela }}>
      {children}
    </TenantContext.Provider>
  );
};
