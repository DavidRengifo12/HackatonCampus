import { useState, useEffect } from "react";
import {
  obtenerCiudades,
  obtenerVuelosDisponibles,
} from "../services/openaiService";
import supabase from "../Supabase";

const BusquedaVuelos = ({ onSeleccionarVuelo, cantidadPasajeros }) => {
  const [ciudades, setCiudades] = useState([]);
  const [vuelos, setVuelos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    origen: "",
    destino: "",
    fecha: "",
  });

  useEffect(() => {
    cargarCiudades();
    cargarVuelos();
  }, []);

  const cargarCiudades = async () => {
    try {
      const data = await obtenerCiudades(supabase);
      setCiudades(data);
    } catch (error) {
      console.error("Error cargando ciudades:", error);
    }
  };

  const cargarVuelos = async () => {
    setCargando(true);
    try {
      const vuelosData = await obtenerVuelosDisponibles(supabase, filtros);
      setVuelos(vuelosData);
    } catch (error) {
      console.error("Error cargando vuelos:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarVuelos();
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda */}
      <form
        onSubmit={handleBuscar}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origen
            </label>
            <select
              value={filtros.origen}
              onChange={(e) =>
                setFiltros({ ...filtros, origen: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map((ciudad) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre} ({ciudad.codigo_iata})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destino
            </label>
            <select
              value={filtros.destino}
              onChange={(e) =>
                setFiltros({ ...filtros, destino: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map((ciudad) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre} ({ciudad.codigo_iata})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              max={
                new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={cargando}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {cargando ? "Buscando..." : "Buscar Vuelos"}
            </button>
          </div>
        </div>
      </form>

      {/* Lista de vuelos */}
      <div className="space-y-4">
        {cargando ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Buscando vuelos...</p>
          </div>
        ) : vuelos.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">
              No se encontraron vuelos con esos criterios.
            </p>
          </div>
        ) : (
          vuelos.map((vuelo) => {
            const suficientesAsientos =
              vuelo.asientosDisponibles >= cantidadPasajeros;

            return (
              <div
                key={vuelo.id}
                className={`bg-white p-6 rounded-lg shadow-md border-2 transition-all ${
                  suficientesAsientos
                    ? "border-gray-200 hover:border-blue-500"
                    : "border-red-200 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {vuelo.ciudad_origen?.nombre} →{" "}
                      {vuelo.ciudad_destino?.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Vuelo: {vuelo.codigo_vuelo} | {vuelo.modelo_avion?.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatearPrecio(vuelo.precio_base)}
                    </p>
                    <p className="text-xs text-gray-500">por persona</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Salida</p>
                    <p className="font-semibold">
                      {new Date(vuelo.fecha_salida).toLocaleDateString(
                        "es-CO",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{vuelo.hora_salida}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Llegada</p>
                    <p className="font-semibold">
                      {new Date(vuelo.fecha_llegada).toLocaleDateString(
                        "es-CO",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {vuelo.hora_llegada}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Asientos disponibles
                    </p>
                    <p
                      className={`font-semibold ${
                        suficientesAsientos ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {vuelo.asientosDisponibles} / {vuelo.capacidad}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Capacidad requerida</p>
                    <p className="font-semibold">
                      {cantidadPasajeros} pasajeros
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSeleccionarVuelo(vuelo)}
                  disabled={!suficientesAsientos}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    suficientesAsientos
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {suficientesAsientos
                    ? "Seleccionar y elegir asientos"
                    : "Asientos insuficientes"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BusquedaVuelos;
