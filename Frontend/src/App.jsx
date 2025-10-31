import { useState, useEffect } from "react";
import "./App.css";
import supabase from "./Supabase";
import { obtenerVuelosDisponibles } from "./services/openaiService";
import AsistenteIA from "./components/AsistenteIA";
import BusquedaVuelos from "./components/BusquedaVuelos";
import MapaAsientos from "./components/MapaAsientos";
import RegistroPasajeros from "./components/RegistroPasajeros";

function App() {
  const [paso, setPaso] = useState("busqueda"); // 'busqueda', 'asientos', 'registro', 'completo'
  const [cantidadPasajeros, setCantidadPasajeros] = useState(1);
  const [vueloSeleccionado, setVueloSeleccionado] = useState(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [vuelosData, setVuelosData] = useState([]);
  const [mostrarAsistente, setMostrarAsistente] = useState(false);

  useEffect(() => {
    cargarVuelos();
  }, []);

  const cargarVuelos = async () => {
    try {
      const vuelos = await obtenerVuelosDisponibles(supabase);
      setVuelosData(vuelos);
    } catch (error) {
      console.error("Error cargando vuelos:", error);
    }
  };

  const handleSeleccionarVuelo = (vuelo) => {
    setVueloSeleccionado(vuelo);
    setAsientosSeleccionados([]);
    setPaso("asientos");
  };

  const handleAsientosSeleccionados = (asientos) => {
    setAsientosSeleccionados(asientos);
  };

  const handleContinuarARegistro = () => {
    if (asientosSeleccionados.length === cantidadPasajeros) {
      setPaso("registro");
    } else {
      alert(`Debes seleccionar exactamente ${cantidadPasajeros} asiento(s)`);
    }
  };

  const handleCompletarRegistro = (pasajeros) => {
    console.log("Registro completado:", {
      vuelo: vueloSeleccionado,
      asientos: asientosSeleccionados,
      pasajeros: pasajeros,
    });

    // Aquí puedes implementar la lógica para guardar la reserva en Supabase
    alert("¡Reserva completada exitosamente! (Implementar guardado en BD)");
    setPaso("completo");
  };

  const volverABusqueda = () => {
    setPaso("busqueda");
    setVueloSeleccionado(null);
    setAsientosSeleccionados([]);
  };

  const contexto = {
    cantidadPasajeros,
    paso,
    vueloSeleccionado: vueloSeleccionado?.codigo_vuelo || null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              ✈️ Sistema de Reservas Aéreas
            </h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setMostrarAsistente(!mostrarAsistente)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>🤖</span>
                <span>Asistente IA</span>
              </button>
              {paso !== "busqueda" && (
                <button
                  onClick={volverABusqueda}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Volver a Búsqueda
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Indicador de pasos */}
      {paso !== "completo" && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4">
              <div
                className={`flex items-center gap-2 ${
                  paso === "busqueda"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paso === "busqueda"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <span>Búsqueda de Vuelos</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div
                className={`flex items-center gap-2 ${
                  paso === "asientos"
                    ? "text-blue-600 font-semibold"
                    : paso === "registro"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paso === "asientos" || paso === "registro"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <span>Selección de Asientos</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div
                className={`flex items-center gap-2 ${
                  paso === "registro"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paso === "registro"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  3
                </div>
                <span>Registro de Pasajeros</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal */}
          <div
            className={`${
              mostrarAsistente ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            {paso === "busqueda" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Búsqueda de Vuelos
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad de Pasajeros (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={cantidadPasajeros}
                      onChange={(e) =>
                        setCantidadPasajeros(
                          Math.min(
                            5,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <BusquedaVuelos
                  onSeleccionarVuelo={handleSeleccionarVuelo}
                  cantidadPasajeros={cantidadPasajeros}
                />
              </div>
            )}

            {paso === "asientos" && vueloSeleccionado && (
              <MapaAsientos
                vuelo={vueloSeleccionado}
                cantidadPasajeros={cantidadPasajeros}
                onAsientosSeleccionados={handleAsientosSeleccionados}
                onContinuar={handleContinuarARegistro}
              />
            )}

            {paso === "registro" && vueloSeleccionado && (
              <RegistroPasajeros
                vuelo={vueloSeleccionado}
                asientosSeleccionados={asientosSeleccionados}
                cantidadPasajeros={cantidadPasajeros}
                onCompletarRegistro={handleCompletarRegistro}
              />
            )}

            {paso === "completo" && (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  ¡Reserva Completada!
                </h2>
                <p className="text-gray-600 mb-6">
                  Tu reserva ha sido procesada exitosamente. Recibirás un correo
                  de confirmación.
                </p>
                <button
                  onClick={volverABusqueda}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Realizar Nueva Búsqueda
                </button>
              </div>
            )}
          </div>

          {/* Panel del asistente IA */}
          <div className={`lg:col-span-1 ${mostrarAsistente ? "" : "hidden"}`}>
            <div
              className="sticky top-4"
              style={{ height: "calc(100vh - 2rem)" }}
            >
              <AsistenteIA vuelosData={vuelosData} contexto={contexto} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-sm">
          <p>
            © 2024 Sistema de Reservas Aéreas - Powered by OpenAI & Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
