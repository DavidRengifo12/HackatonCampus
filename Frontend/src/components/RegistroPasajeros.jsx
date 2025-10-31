import { useState } from "react";

const RegistroPasajeros = ({
  vuelo,
  asientosSeleccionados,
  cantidadPasajeros,
  onCompletarRegistro,
}) => {
  const [pasajeros, setPasajeros] = useState(() => {
    // Inicializar con el número correcto de pasajeros
    return Array.from({ length: cantidadPasajeros }, () => ({
      primer_apellido: "",
      segundo_apellido: "",
      nombres: "",
      fecha_nacimiento: "",
      genero: "",
      tipo_documento: "",
      numero_documento: "",
      es_infante: false,
      celular: "",
      correo_electronico: "",
    }));
  });

  const [errores, setErrores] = useState({});

  const validarPasajero = (index) => {
    const pasajero = pasajeros[index];
    const nuevosErrores = { ...errores };

    if (!pasajero.primer_apellido.trim()) {
      nuevosErrores[`${index}-primer_apellido`] = "Requerido";
    }
    if (!pasajero.nombres.trim()) {
      nuevosErrores[`${index}-nombres`] = "Requerido";
    }
    if (!pasajero.fecha_nacimiento) {
      nuevosErrores[`${index}-fecha_nacimiento`] = "Requerido";
    }
    if (!pasajero.genero) {
      nuevosErrores[`${index}-genero`] = "Requerido";
    }
    if (!pasajero.tipo_documento) {
      nuevosErrores[`${index}-tipo_documento`] = "Requerido";
    }
    if (!pasajero.numero_documento.trim()) {
      nuevosErrores[`${index}-numero_documento`] = "Requerido";
    }
    if (!pasajero.correo_electronico.trim()) {
      nuevosErrores[`${index}-correo_electronico`] = "Requerido";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pasajero.correo_electronico)
    ) {
      nuevosErrores[`${index}-correo_electronico`] = "Correo inválido";
    }

    // Validar si es infante
    if (pasajero.es_infante) {
      const fechaNac = new Date(pasajero.fecha_nacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      if (edad >= 3) {
        nuevosErrores[`${index}-es_infante`] =
          "Un infante debe ser menor de 3 años";
      }
    }

    setErrores(nuevosErrores);
    return (
      Object.keys(nuevosErrores).filter((key) => key.startsWith(`${index}-`))
        .length === 0
    );
  };

  const actualizarPasajero = (index, campo, valor) => {
    const nuevosPasajeros = [...pasajeros];
    nuevosPasajeros[index] = {
      ...nuevosPasajeros[index],
      [campo]: valor,
    };
    setPasajeros(nuevosPasajeros);

    // Limpiar error del campo si existe
    if (errores[`${index}-${campo}`]) {
      const nuevosErrores = { ...errores };
      delete nuevosErrores[`${index}-${campo}`];
      setErrores(nuevosErrores);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar todos los pasajeros
    let todosValidos = true;
    pasajeros.forEach((_, index) => {
      if (!validarPasajero(index)) {
        todosValidos = false;
      }
    });

    if (!todosValidos) {
      alert("Por favor, completa correctamente todos los campos requeridos.");
      return;
    }

    // Asignar asientos a pasajeros
    const pasajerosConAsientos = pasajeros.map((pasajero, index) => ({
      ...pasajero,
      asiento_id: asientosSeleccionados[index]?.id,
      asiento_numero: asientosSeleccionados[index]?.numero_asiento,
    }));

    onCompletarRegistro(pasajerosConAsientos);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Registro de Pasajeros
        </h2>
        <p className="text-gray-600 mb-6">
          Vuelo: {vuelo.codigo_vuelo} | {vuelo.ciudad_origen?.nombre} →{" "}
          {vuelo.ciudad_destino?.nombre}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {pasajeros.map((pasajero, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Pasajero {index + 1}
                {asientosSeleccionados[index] && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    (Asiento: {asientosSeleccionados[index].numero_asiento})
                  </span>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primer Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primer Apellido *
                  </label>
                  <input
                    type="text"
                    value={pasajero.primer_apellido}
                    onChange={(e) =>
                      actualizarPasajero(
                        index,
                        "primer_apellido",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores[`${index}-primer_apellido`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errores[`${index}-primer_apellido`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[`${index}-primer_apellido`]}
                    </p>
                  )}
                </div>

                {/* Segundo Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    value={pasajero.segundo_apellido}
                    onChange={(e) =>
                      actualizarPasajero(
                        index,
                        "segundo_apellido",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Nombres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={pasajero.nombres}
                    onChange={(e) =>
                      actualizarPasajero(index, "nombres", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores[`${index}-nombres`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errores[`${index}-nombres`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[`${index}-nombres`]}
                    </p>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={pasajero.fecha_nacimiento}
                    onChange={(e) =>
                      actualizarPasajero(
                        index,
                        "fecha_nacimiento",
                        e.target.value
                      )
                    }
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores[`${index}-fecha_nacimiento`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errores[`${index}-fecha_nacimiento`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[`${index}-fecha_nacimiento`]}
                    </p>
                  )}
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género *
                  </label>
                  <select
                    value={pasajero.genero}
                    onChange={(e) =>
                      actualizarPasajero(index, "genero", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores[`${index}-genero`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errores[`${index}-genero`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[`${index}-genero`]}
                    </p>
                  )}
                </div>

                {/* Tipo de Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    value={pasajero.tipo_documento}
                    onChange={(e) =>
                      actualizarPasajero(
                        index,
                        "tipo_documento",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores[`${index}-tipo_documento`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="cedula">Cédula</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="tarjeta_identidad">
                      Tarjeta de Identidad
                    </option>
                    <option value="otro">Otro</option>
                  </select>
                  {errores[`${index}-tipo_documento`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[`${index}-tipo_documento`]}
                    </p>
                  )}
                </div>

                {/* Número de Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    value={pasajero.numero_documento}
                    onChange={(e) =>
                      actualizarPasajero(
                        index,
                        "numero_documento",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores[`${index}-numero_documento`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errores[`${index}-numero_documento`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[`${index}-numero_documento`]}
                    </p>
                  )}
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Celular
                  </label>
                  <input
                    type="tel"
                    value={pasajero.celular}
                    onChange={(e) =>
                      actualizarPasajero(index, "celular", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={pasajero.correo_electronico}
                    onChange={(e) =>
                      actualizarPasajero(
                        index,
                        "correo_electronico",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores[`${index}-correo_electronico`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errores[`${index}-correo_electronico`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[`${index}-correo_electronico`]}
                    </p>
                  )}
                </div>

                {/* Es Infante */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`infante-${index}`}
                    checked={pasajero.es_infante}
                    onChange={(e) =>
                      actualizarPasajero(index, "es_infante", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`infante-${index}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Es infante (menor de 3 años)
                  </label>
                  {errores[`${index}-es_infante`] && (
                    <p className="text-red-500 text-xs">
                      {errores[`${index}-es_infante`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continuar al Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroPasajeros;
