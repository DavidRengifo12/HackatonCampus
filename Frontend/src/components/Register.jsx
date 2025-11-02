import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar email
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El correo electrónico no es válido';
    }

    // Validar contraseña
    if (!formData.password.trim()) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword.trim()) {
      nuevosErrores.confirmPassword = 'Por favor, confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es requerido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      const nuevosErrores = { ...errores };
      delete nuevosErrores[name];
      setErrores(nuevosErrores);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setEnviando(true);
    setErrores({});

    try {
      const metadata = {
        nombre: formData.nombre,
        apellido: formData.apellido,
      };

      const { error } = await signUp(formData.email, formData.password, metadata);

      if (error) {
        // Mapear errores comunes de Supabase a mensajes más amigables
        let mensajeError = error;
        if (error.includes('User already registered')) {
          mensajeError = 'Este correo electrónico ya está registrado. ¿Ya tienes una cuenta?';
        } else if (error.includes('Password should be at least')) {
          mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (error.includes('Invalid email')) {
          mensajeError = 'El correo electrónico no es válido.';
        } else if (error.includes('Signup is disabled')) {
          mensajeError = 'El registro está deshabilitado temporalmente.';
        }

        setErrores({ submit: mensajeError });
      } else {
        // Mostrar mensaje de éxito y redirigir
        alert(
          '¡Registro exitoso! Por favor, verifica tu correo electrónico para confirmar tu cuenta.'
        );
        navigate('/login');
      }
    } catch (error) {
      const mensajeError = error?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
      setErrores({ submit: mensajeError });
    } finally {
      setEnviando(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen  from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              ✈️ Crear Cuenta
            </h1>
            <p className="text-gray-600">
              Regístrate para comenzar a reservar vuelos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error general */}
            {errores.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errores.submit}
              </div>
            )}

            {/* Campo Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
                required
                disabled={enviando}
              />
              {errores.nombre && (
                <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
              )}
            </div>

            {/* Campo Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.apellido ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu apellido"
                required
                disabled={enviando}
              />
              {errores.apellido && (
                <p className="text-red-500 text-xs mt-1">{errores.apellido}</p>
              )}
            </div>

            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            {/* Campo Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                required
                disabled={enviando}
              />
              {errores.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errores.confirmPassword}</p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {enviando ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Link a Login */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

