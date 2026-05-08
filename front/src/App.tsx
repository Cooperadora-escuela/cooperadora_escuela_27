import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import HomePages from './pages/HomePages';
import RegistroForm from './components/RegistroForm';
import LoginFormPages from './pages/LoginFormPages';
import PagosPage from './pages/PagosPage';
import PublicacionesPage from './pages/PublicacionesPage';
import EstadoCuentaPage from './pages/EstadoCuentaPage';
import MisHijosPage from './pages/MisHijosPage';
import UsuariosPage from './pages/UsuariosPage';
import PerfilPage from './pages/PerfilPage';
import CuotasPage from './pages/CuotasPage';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header />
      <Routes>
        <Route path="/" element={<LoginFormPages />} />
        <Route path="/about" element={<HomePages />} />
        <Route path="/registro" element={<RegistroForm />} />
        <Route path='/login' element={<LoginFormPages />} />
        <Route path='/pagos' element={<PagosPage />} />
        <Route path='/publicaciones' element={<PublicacionesPage />} />
        <Route path='/estado-cuenta' element={<EstadoCuentaPage />} />
        <Route path='/mis-hijos' element={<MisHijosPage />} />
        <Route path='/usuarios' element={<UsuariosPage />} />
        <Route path='/perfil' element={<PerfilPage />} />
        <Route path='/cuotas' element={<CuotasPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
