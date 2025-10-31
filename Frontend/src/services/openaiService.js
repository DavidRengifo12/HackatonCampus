import OpenAI from "openai";

// Inicializar cliente de OpenAI con la API key del .env
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Solo para desarrollo, en producción usar backend
});

/**
 * Obtiene información de vuelos disponibles desde Supabase
 */
export const obtenerVuelosDisponibles = async (supabase, filtros = {}) => {
  try {
    let query = supabase
      .from("vuelos")
      .select(
        `
        *,
        ciudad_origen:ciudades!vuelos_ciudad_origen_id_fkey(id, nombre, codigo_iata, pais),
        ciudad_destino:ciudades!vuelos_ciudad_destino_id_fkey(id, nombre, codigo_iata, pais),
        modelo_avion:modelos_avion(id, nombre, capacidad_total, descripcion),
        asientos(id, numero_asiento, estado, tipo_asiento)
      `
      )
      .eq("estado", "disponible")
      .gte("fecha_salida", new Date().toISOString().split("T")[0]);

    if (filtros.origen) {
      query = query.eq("ciudad_origen_id", filtros.origen);
    }
    if (filtros.destino) {
      query = query.eq("ciudad_destino_id", filtros.destino);
    }
    if (filtros.fecha) {
      query = query.eq("fecha_salida", filtros.fecha);
    }

    const { data, error } = await query.order("fecha_salida", {
      ascending: true,
    });

    if (error) throw error;

    // Contar asientos disponibles por vuelo
    const vuelosConAsientos = data.map((vuelo) => {
      const asientosDisponibles = vuelo.asientos.filter(
        (a) => a.estado === "disponible"
      ).length;
      return {
        ...vuelo,
        asientosDisponibles,
        capacidad: vuelo.modelo_avion.capacidad_total,
      };
    });

    return vuelosConAsientos;
  } catch (error) {
    console.error("Error obteniendo vuelos:", error);
    throw error;
  }
};

/**
 * Consulta al asistente de IA sobre vuelos disponibles
 */
export const consultarAsistenteIA = async (
  mensaje,
  vuelosData,
  contexto = {}
) => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error("API Key de OpenAI no configurada en .env");
    }

    // Formatear información de vuelos para el contexto
    const vuelosFormateados = vuelosData
      .map((v) => {
        const origen = v.ciudad_origen?.nombre || "N/A";
        const destino = v.ciudad_destino?.nombre || "N/A";
        const fecha = new Date(v.fecha_salida).toLocaleDateString("es-CO");
        const hora = v.hora_salida;
        const precio = new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
        }).format(v.precio_base);
        const disponibles = v.asientosDisponibles || 0;
        const modelo = v.modelo_avion?.nombre || "N/A";

        return `- Vuelo ${v.codigo_vuelo}: ${origen} → ${destino} el ${fecha} a las ${hora}. Precio: ${precio}. Asientos disponibles: ${disponibles}/${v.capacidad} (Modelo: ${modelo})`;
      })
      .join("\n");

    const sistemaPrompt = `Eres un asistente virtual especializado en ayudar a los usuarios a encontrar y reservar vuelos. 
    
Tienes acceso a información actualizada de vuelos disponibles. Cuando el usuario pregunte sobre vuelos, usa la información proporcionada para dar respuestas precisas y útiles.

Información de vuelos disponibles:
${vuelosFormateados}

Contexto adicional:
${JSON.stringify(contexto, null, 2)}

Responde de manera amigable, profesional y en español. Si el usuario pregunta algo que no puedes responder con la información disponible, sugiere opciones alternativas o pide más detalles.

IMPORTANTE: Solo menciona vuelos que realmente estén en la lista proporcionada. No inventes vuelos.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sistemaPrompt },
        { role: "user", content: mensaje },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error consultando asistente IA:", error);
    throw error;
  }
};

/**
 * Obtiene ciudades disponibles para búsqueda
 */
export const obtenerCiudades = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from("ciudades")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error obteniendo ciudades:", error);
    throw error;
  }
};
