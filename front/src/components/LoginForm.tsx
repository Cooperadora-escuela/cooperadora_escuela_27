// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../contex/UserContex';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom'; // 👈 Agregamos useNavigate

const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate(); // 👈 Hook para redirigir
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
                navigate('/about'); // 👈 Redirige a /about
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
        <div className="min-h-screen bg-gradient-to-b from-cyan-100 dark:from-gray-900 to-white dark:to-gray-900 flex flex-col items-center justify-start pt-12">
            <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">Iniciar sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contraseña *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        />
                    </div>

                    {/* Botón de envío */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors disabled:bg-cyan-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                    <div className="text-center mt-4">
                        <Link to="/registro" className="text-cyan-500 hover:text-cyan-700 text-sm">
                            Resgistrate aqui
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;