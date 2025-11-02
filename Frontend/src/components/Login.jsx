import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!email.trim()) {
      nuevosErrores.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevosErrores.email = 'El correo electrónico no es válido';
    }

    if (!password.trim()) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setEnviando(true);
    setErrores({});

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Mapear errores comunes de Supabase a mensajes más amigables
        let mensajeError = error;
        if (error.includes('Invalid login credentials')) {
          mensajeError = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (error.includes('Email not confirmed')) {
          mensajeError = 'Por favor, confirma tu correo electrónico antes de iniciar sesión.';
        } else if (error.includes('Too many requests')) {
          mensajeError = 'Demasiados intentos. Por favor, espera un momento e intenta nuevamente.';
        }

        setErrores({ submit: mensajeError });
      } else {
        // Redirigir al dashboard o página principal
        navigate('/');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrores({ submit: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.' });
    } finally {
      setEnviando(false);
    }
  };

  const limpiarError = (campo) => {
    if (errores[campo]) {
      const nuevosErrores = { ...errores };
      delete nuevosErrores[campo];
      setErrores(nuevosErrores);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              ✈️ Iniciar Sesión
            </h1>
            <p className="text-gray-600">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error general */}
            {errores.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errores.submit}
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  limpiarError('email');
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="tu@correo.com"
                required
                disabled={enviando}
              />
              {errores.email && (
                <p className="text-red-500 text-xs mt-1">{errores.email}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  limpiarError('password');
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                required
                disabled={enviando}
              />
              {errores.password && (
                <p className="text-red-500 text-xs mt-1">{errores.password}</p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {enviando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Link a Register */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

