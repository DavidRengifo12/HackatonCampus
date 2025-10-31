-- Script para insertar vuelos de ejemplo
-- Compatible con Supabase (PostgreSQL)
-- Fecha: 2024
-- NOTA: Este script genera vuelos de ejemplo. Ajustar las fechas según sea necesario.

-- Función auxiliar para insertar vuelos de ejemplo
-- Ejecutar este script después de insertar los datos iniciales

-- Vuelos Bogotá - Medellín
INSERT INTO vuelos (codigo_vuelo, modelo_avion_id, ciudad_origen_id, ciudad_destino_id, 
                    fecha_salida, hora_salida, fecha_llegada, hora_llegada, precio_base, estado)
SELECT 
    'AV' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    (SELECT id FROM modelos_avion WHERE nombre = 'Airbus A320' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Bogotá' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Medellín' LIMIT 1),
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '6 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '7 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    280000.00,
    'disponible'
FROM generate_series(1, 30)
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- Vuelos Medellín - Bogotá
INSERT INTO vuelos (codigo_vuelo, modelo_avion_id, ciudad_origen_id, ciudad_destino_id, 
                    fecha_salida, hora_salida, fecha_llegada, hora_llegada, precio_base, estado)
SELECT 
    'AV' || LPAD((30 + ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    (SELECT id FROM modelos_avion WHERE nombre = 'Boeing 737' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Medellín' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Bogotá' LIMIT 1),
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '8 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '9 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    290000.00,
    'disponible'
FROM generate_series(1, 30)
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- Vuelos Bogotá - Cali
INSERT INTO vuelos (codigo_vuelo, modelo_avion_id, ciudad_origen_id, ciudad_destino_id, 
                    fecha_salida, hora_salida, fecha_llegada, hora_llegada, precio_base, estado)
SELECT 
    'AV' || LPAD((60 + ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    (SELECT id FROM modelos_avion WHERE nombre = 'Embraer E190' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Bogotá' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Cali' LIMIT 1),
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '10 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '11 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    320000.00,
    'disponible'
FROM generate_series(1, 25)
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- Vuelos Bogotá - Cartagena
INSERT INTO vuelos (codigo_vuelo, modelo_avion_id, ciudad_origen_id, ciudad_destino_id, 
                    fecha_salida, hora_salida, fecha_llegada, hora_llegada, precio_base, estado)
SELECT 
    'AV' || LPAD((85 + ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    (SELECT id FROM modelos_avion WHERE nombre = 'Airbus A320' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Bogotá' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Cartagena' LIMIT 1),
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '7 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '8 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    350000.00,
    'disponible'
FROM generate_series(1, 25)
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- Vuelos Bogotá - Miami (Internacional)
INSERT INTO vuelos (codigo_vuelo, modelo_avion_id, ciudad_origen_id, ciudad_destino_id, 
                    fecha_salida, hora_salida, fecha_llegada, hora_llegada, precio_base, estado)
SELECT 
    'AV' || LPAD((110 + ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    (SELECT id FROM modelos_avion WHERE nombre = 'Boeing 787 Dreamliner' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Bogotá' LIMIT 1),
    (SELECT id FROM ciudades WHERE nombre = 'Miami' LIMIT 1),
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '6 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
    (INTERVAL '10 hours' + ((ROW_NUMBER() OVER () % 24)::INTEGER || ' hours')::INTERVAL)::TIME,
    850000.00,
    'disponible'
FROM generate_series(1, 20)
ON CONFLICT (codigo_vuelo) DO NOTHING;

-- Función para generar asientos automáticamente cuando se crea un vuelo
-- Esta función se ejecutará mediante un trigger para crear los asientos según la capacidad del modelo

CREATE OR REPLACE FUNCTION generate_asientos_for_vuelo()
RETURNS TRIGGER AS $$
DECLARE
    capacidad INTEGER;
    i INTEGER;
    numero_asiento TEXT;
    tipo_asiento TEXT;
BEGIN
    -- Obtener la capacidad del modelo de avión
    SELECT capacidad_total INTO capacidad
    FROM modelos_avion
    WHERE id = NEW.modelo_avion_id;
    
    -- Generar asientos según la capacidad
    FOR i IN 1..capacidad LOOP
        -- Generar número de asiento (ej: 1A, 1B, 2A, etc.)
        numero_asiento := ((i - 1) / 6 + 1)::TEXT || 
                         CHR(65 + ((i - 1) % 6)); -- 65 es 'A' en ASCII
        
        -- Determinar tipo de asiento (los primeros 20% son ejecutiva, 5% primera clase, resto económica)
        IF i <= (capacidad * 0.05) THEN
            tipo_asiento := 'primera_clase';
        ELSIF i <= (capacidad * 0.25) THEN
            tipo_asiento := 'ejecutiva';
        ELSE
            tipo_asiento := 'economica';
        END IF;
        
        -- Insertar asiento
        INSERT INTO asientos (vuelo_id, numero_asiento, estado, tipo_asiento)
        VALUES (NEW.id, numero_asiento, 'disponible', tipo_asiento);
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar asientos automáticamente cuando se crea un vuelo
CREATE TRIGGER auto_generate_asientos
AFTER INSERT ON vuelos
FOR EACH ROW
EXECUTE FUNCTION generate_asientos_for_vuelo();

-- Si ya existen vuelos sin asientos, ejecutar esta función para generarlos
DO $$
DECLARE
    vuelo_record RECORD;
    capacidad INTEGER;
    i INTEGER;
    num_asiento TEXT;
    tipo_asiento_var TEXT;
BEGIN
    FOR vuelo_record IN 
        SELECT v.id, v.modelo_avion_id, ma.capacidad_total
        FROM vuelos v
        JOIN modelos_avion ma ON v.modelo_avion_id = ma.id
        WHERE NOT EXISTS (
            SELECT 1 FROM asientos a WHERE a.vuelo_id = v.id
        )
    LOOP
        capacidad := vuelo_record.capacidad_total;
        
        FOR i IN 1..capacidad LOOP
            num_asiento := ((i - 1) / 6 + 1)::TEXT || 
                             CHR(65 + ((i - 1) % 6));
            
            IF i <= (capacidad * 0.05) THEN
                tipo_asiento_var := 'primera_clase';
            ELSIF i <= (capacidad * 0.25) THEN
                tipo_asiento_var := 'ejecutiva';
            ELSE
                tipo_asiento_var := 'economica';
            END IF;
            
            INSERT INTO asientos (vuelo_id, numero_asiento, estado, tipo_asiento)
            VALUES (vuelo_record.id, num_asiento, 'disponible', tipo_asiento_var)
            ON CONFLICT (vuelo_id, numero_asiento) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

