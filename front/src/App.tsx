import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/Home';
import About from './components/About'; 
import RegistroForm from './components/RegistroForm';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <BrowserRouter>
    <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/registro" element={<RegistroForm />} />
        <Route path='/login' element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;