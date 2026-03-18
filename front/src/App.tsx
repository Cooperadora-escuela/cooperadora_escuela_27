import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePages from './pages/HomePages';
import RegistroForm from './components/RegistroForm';
import LoginFormPages from './pages/LoginFormPages';
//import AboutPages from './pages/AboutPages';

function App() {
  return (
    <BrowserRouter>
    <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        <Route path="/" element={<LoginFormPages />} />
        <Route path="/about" element={<HomePages />} />
        <Route path="/registro" element={<RegistroForm />} />
        <Route path='/login' element={<LoginFormPages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;