import { useState, useRef, useEffect } from "react";
import { consultarAsistenteIA } from "../services/openaiService";

const AsistenteIA = ({ vuelosData, contexto }) => {
  const [mensajes, setMensajes] = useState([
    {
      rol: "assistant",
      contenido:
        "¡Hola! Soy tu asistente virtual para ayudarte a encontrar vuelos. ¿Qué vuelo estás buscando? Puedo ayudarte con: rutas disponibles, precios, fechas, modelos de avión y disponibilidad de asientos.",
    },
  ]);
  const [mensajeActual, setMensajeActual] = useState("");
  const [cargando, setCargando] = useState(false);
  const mensajesEndRef = useRef(null);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeActual.trim() || cargando) return;

    const mensajeUsuario = mensajeActual.trim();
    setMensajeActual("");

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario = {
      rol: "user",
      contenido: mensajeUsuario,
    };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setCargando(true);

    try {
      const respuesta = await consultarAsistenteIA(
        mensajeUsuario,
        vuelosData,
        contexto
      );

      const nuevoMensajeAsistente = {
        rol: "assistant",
        contenido: respuesta,
      };
      setMensajes((prev) => [...prev, nuevoMensajeAsistente]);
    } catch (error) {
      console.error("Error:", error);
      const mensajeError = {
        rol: "assistant",
        contenido:
          "Lo siento, hubo un error al procesar tu consulta. Por favor, verifica que la API Key de OpenAI esté configurada correctamente en el archivo .env",
      };
      setMensajes((prev) => [...prev, mensajeError]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-lg">Asistente Virtual</h3>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {mensajes.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.rol === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.rol === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 shadow-sm border border-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.contenido}</p>
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
              </div>
            </div>
          </div>
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={enviarMensaje}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={mensajeActual}
            onChange={(e) => setMensajeActual(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={cargando}
          />
          <button
            type="submit"
            disabled={!mensajeActual.trim() || cargando}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AsistenteIA;
