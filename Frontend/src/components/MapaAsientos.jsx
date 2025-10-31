import { useState, useEffect } from "react";
import supabase from "../Supabase";

const MapaAsientos = ({
  vuelo,
  cantidadPasajeros,
  onAsientosSeleccionados,
  onContinuar,
}) => {
  const [asientos, setAsientos] = useState([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarAsientos();
    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("asientos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "asientos",
          filter: `vuelo_id=eq.${vuelo.id}`,
        },
        () => {
          cargarAsientos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [vuelo.id]);

  const cargarAsientos = async () => {
    try {
      const { data, error } = await supabase
        .from("asientos")
        .select("*")
        .eq("vuelo_id", vuelo.id)
        .order("numero_asiento");

      if (error) throw error;
      setAsientos(data);
      setCargando(false);
    } catch (err) {
      console.error("Error cargando asientos:", err);
      setError("Error al cargar los asientos");
      setCargando(false);
    }
  };

  const toggleAsiento = (asiento) => {
    // No permitir seleccionar asientos ocupados o reservados
    if (asiento.estado !== "disponible") {
      return;
    }

    // Verificar si ya está seleccionado
    const yaSeleccionado = asientosSeleccionados.find(
      (a) => a.id === asiento.id
    );

    if (yaSeleccionado) {
      // Deseleccionar
      const nuevos = asientosSeleccionados.filter((a) => a.id !== asiento.id);
      setAsientosSeleccionados(nuevos);
      onAsientosSeleccionados(nuevos);
    } else {
      // Verificar límite de selección
      if (asientosSeleccionados.length >= cantidadPasajeros) {
        alert(`Solo puedes seleccionar ${cantidadPasajeros} asiento(s)`);
        return;
      }

      // Seleccionar
      const nuevos = [...asientosSeleccionados, asiento];
      setAsientosSeleccionados(nuevos);
      onAsientosSeleccionados(nuevos);
    }
  };

  const generarMapaAsientos = () => {
    if (!asientos.length) return null;

    // Organizar asientos por fila (extraer número de fila)
    const asientosPorFila = {};

    asientos.forEach((asiento) => {
      // Extraer número de fila (ej: "12A" -> fila 12)
      const match = asiento.numero_asiento.match(/^(\d+)/);
      const fila = match ? parseInt(match[1]) : 0;

      if (!asientosPorFila[fila]) {
        asientosPorFila[fila] = [];
      }
      asientosPorFila[fila].push(asiento);
    });

    // Ordenar filas
    const filasOrdenadas = Object.keys(asientosPorFila)
      .map(Number)
      .sort((a, b) => a - b);

    // Determinar columnas (A, B, C, D, E, F, etc.)
    const columnas = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const maxColumnas = Math.max(
      ...filasOrdenadas.map((f) => asientosPorFila[f].length)
    );

    return (
      <div className="space-y-2">
        {/* Leyenda */}
        <div className="flex justify-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-200 border-2 border-blue-500 rounded"></div>
            <span className="text-sm">Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-200 border-2 border-red-500 rounded"></div>
            <span className="text-sm">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded"></div>
            <span className="text-sm">Reservado</span>
          </div>
        </div>

        {/* Indicador de pasillo */}
        <div className="mb-2 text-center text-xs text-gray-500">
          <p className="mb-1">Pasillo</p>
        </div>

        {/* Mapa de asientos */}
        <div className="max-h-[500px] overflow-y-auto border-2 border-gray-200 rounded-lg p-4 bg-white">
          {filasOrdenadas.map((fila) => {
            const asientosFila = asientosPorFila[fila];
            // Ordenar asientos por letra
            asientosFila.sort((a, b) => {
              const letraA = a.numero_asiento.replace(/^\d+/, "");
              const letraB = b.numero_asiento.replace(/^\d+/, "");
              return letraA.localeCompare(letraB);
            });

            return (
              <div
                key={fila}
                className="flex items-center justify-center gap-2 mb-1"
              >
                {/* Número de fila */}
                <span className="w-8 text-sm font-semibold text-gray-700">
                  {fila}
                </span>

                {/* Asientos */}
                {asientosFila.map((asiento, idx) => {
                  const letra = asiento.numero_asiento.replace(/^\d+/, "");
                  const esSeleccionado = asientosSeleccionados.find(
                    (a) => a.id === asiento.id
                  );
                  const esPasillo =
                    idx === Math.floor(asientosFila.length / 2) ||
                    idx === Math.floor(asientosFila.length / 2) - 1;

                  let bgColor = "bg-green-100";
                  let borderColor = "border-green-500";
                  let cursor = "cursor-pointer";

                  if (esSeleccionado) {
                    bgColor = "bg-blue-200";
                    borderColor = "border-blue-500";
                  } else if (
                    asiento.estado === "ocupado" ||
                    asiento.estado === "reservado"
                  ) {
                    bgColor =
                      asiento.estado === "ocupado"
                        ? "bg-red-200"
                        : "bg-gray-200";
                    borderColor =
                      asiento.estado === "ocupado"
                        ? "border-red-500"
                        : "border-gray-400";
                    cursor = "cursor-not-allowed";
                  }

                  return (
                    <div key={asiento.id} className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAsiento(asiento)}
                        disabled={asiento.estado !== "disponible"}
                        className={`w-8 h-8 ${bgColor} border-2 ${borderColor} rounded text-xs font-semibold transition-all hover:scale-110 ${cursor} ${
                          asiento.estado !== "disponible" ? "opacity-60" : ""
                        }`}
                        title={`Asiento ${asiento.numero_asiento} - ${asiento.tipo_asiento} - ${asiento.estado}`}
                      >
                        {letra}
                      </button>
                      {esPasillo &&
                        idx === Math.floor(asientosFila.length / 2) - 1 && (
                          <div className="w-4"></div> // Espacio para pasillo
                        )}
                    </div>
                  );
                })}

                {/* Indicador de tipo de asiento para algunas filas */}
                {fila === filasOrdenadas[0] && (
                  <div className="ml-4 text-xs text-gray-500">
                    {asientosFila[0]?.tipo_asiento === "primera_clase" &&
                      "💎 Primera"}
                    {asientosFila[0]?.tipo_asiento === "ejecutiva" &&
                      "⭐ Ejecutiva"}
                    {asientosFila[0]?.tipo_asiento === "economica" &&
                      "Economía"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Asientos seleccionados:</strong>{" "}
            {asientosSeleccionados.length} / {cantidadPasajeros}
          </p>
          {asientosSeleccionados.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Asientos:{" "}
              {asientosSeleccionados.map((a) => a.numero_asiento).join(", ")}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Cargando mapa de asientos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Selecciona tus asientos - Vuelo {vuelo.codigo_vuelo}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {vuelo.ciudad_origen?.nombre} → {vuelo.ciudad_destino?.nombre} |
          Modelo: {vuelo.modelo_avion?.nombre}
        </p>

        {generarMapaAsientos()}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => {
              setAsientosSeleccionados([]);
              onAsientosSeleccionados([]);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar selección
          </button>
          <button
            onClick={onContinuar}
            disabled={asientosSeleccionados.length !== cantidadPasajeros}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              asientosSeleccionados.length === cantidadPasajeros
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continuar al registro de pasajeros
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapaAsientos;
