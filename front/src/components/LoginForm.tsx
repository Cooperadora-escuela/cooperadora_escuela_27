// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../contex/UserContex';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import HeaderForms from './HeaderForms'; 
import FooterForms from './FooterForms';

const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                toast.success('¡Login exitoso!');
                //navigate('/dashboard');
            } else {
                const errorMsg = result.error?.message || 'Credenciales inválidas. Intenta de nuevo.';
                toast.error(errorMsg);
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex flex-col items-center justify-start pt-16">
            {/* Usamos el componente HeaderForms con el subtítulo deseado */}
            <HeaderForms subtitulo="Acceso para miembros de la cooperadora" />

            {/* Tarjeta del formulario */}
            <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Iniciar sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Botón de envío */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                    <div className="text-center mt-4">
                        <Link to="/registro" className="text-purple-600 hover:text-purple-800 text-sm">
                            Resgistrate aqui
                        </Link>
                    </div>
                </form>
            </div>
            <FooterForms/>
        </div>
    );
};

export default LoginForm;