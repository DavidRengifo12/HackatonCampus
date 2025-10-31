-- Script de datos iniciales para Sistema de Compra de Tiquetes Aéreos
-- Compatible con Supabase (PostgreSQL)
-- Fecha: 2024

-- Inserción de modelos de avión
INSERT INTO modelos_avion (nombre, capacidad_total, descripcion, activo) VALUES
('Airbus A320', 180, 'Avión comercial de pasillo único, ideal para vuelos de corta y media distancia', true),
('Airbus A330', 335, 'Avión de fuselaje ancho, perfecto para vuelos de media y larga distancia', true),
('Boeing 737', 178, 'Avión comercial de pasillo único, uno de los más utilizados en el mundo', true),
('Boeing 787 Dreamliner', 290, 'Avión de fuselaje ancho con tecnología avanzada para vuelos de larga distancia', true),
('Embraer E190', 106, 'Avión regional ideal para rutas de corta distancia', true),
('Boeing 777', 396, 'Avión de fuselaje ancho de gran capacidad para vuelos internacionales', true),
('Airbus A350', 325, 'Avión de fuselaje ancho con materiales compuestos, eficiente en combustible', true)
ON CONFLICT DO NOTHING;

-- Inserción de ciudades (principales ciudades colombianas e internacionales)
INSERT INTO ciudades (nombre, codigo_iata, pais, activo) VALUES
-- Ciudades colombianas
('Bogotá', 'BOG', 'Colombia', true),
('Medellín', 'MDE', 'Colombia', true),
('Cali', 'CLO', 'Colombia', true),
('Barranquilla', 'BAQ', 'Colombia', true),
('Cartagena', 'CTG', 'Colombia', true),
('Bucaramanga', 'BGA', 'Colombia', true),
('Pereira', 'PEI', 'Colombia', true),
('Santa Marta', 'SMR', 'Colombia', true),
('Manizales', 'MZL', 'Colombia', true),
('Armenia', 'AXM', 'Colombia', true),
('Pasto', 'PSO', 'Colombia', true),
('Villavicencio', 'VVC', 'Colombia', true),
('Ibagué', 'IBE', 'Colombia', true),
('Cúcuta', 'CUC', 'Colombia', true),
('Montería', 'MTR', 'Colombia', true),
-- Ciudades internacionales
('Miami', 'MIA', 'Estados Unidos', true),
('Nueva York', 'NYC', 'Estados Unidos', true),
('Madrid', 'MAD', 'España', true),
('Barcelona', 'BCN', 'España', true),
('Lima', 'LIM', 'Perú', true),
('Ciudad de México', 'MEX', 'México', true),
('Panamá', 'PTY', 'Panamá', true),
('Quito', 'UIO', 'Ecuador', true),
('Caracas', 'CCS', 'Venezuela', true),
('Buenos Aires', 'EZE', 'Argentina', true),
('São Paulo', 'GRU', 'Brasil', true),
('París', 'CDG', 'Francia', true),
('Londres', 'LHR', 'Reino Unido', true),
('Ámsterdam', 'AMS', 'Países Bajos', true),
('Frankfurt', 'FRA', 'Alemania', true)
ON CONFLICT (nombre) DO NOTHING;

-- Función para generar vuelos de ejemplo (opcional - se puede ejecutar manualmente)
-- Este script inserta algunos vuelos de ejemplo entre las principales ciudades
-- Nota: Los vuelos deben tener fechas válidas (desde hoy hasta 2 meses adelante)

-- Ejemplo de vuelos (se deben ajustar las fechas según la fecha actual)
-- INSERT INTO vuelos (codigo_vuelo, modelo_avion_id, ciudad_origen_id, ciudad_destino_id, 
--                     fecha_salida, hora_salida, fecha_llegada, hora_llegada, precio_base, estado)
-- SELECT 
--     'AV' || LPAD(ROW_NUMBER() OVER ()::TEXT, 4, '0'),
--     (SELECT id FROM modelos_avion WHERE nombre = 'Airbus A320' LIMIT 1),
--     co.id,
--     cd.id,
--     CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
--     (CURRENT_TIME + (ROW_NUMBER() OVER () || ' hours')::INTERVAL)::TIME,
--     CURRENT_DATE + (ROW_NUMBER() OVER () % 60)::INTEGER,
--     (CURRENT_TIME + ((ROW_NUMBER() OVER () + 2) || ' hours')::INTERVAL)::TIME,
--     250000.00 + (RANDOM() * 500000)::DECIMAL(10,2),
--     'disponible'
-- FROM ciudades co
-- CROSS JOIN ciudades cd
-- WHERE co.id != cd.id
-- AND co.pais = 'Colombia'
-- AND cd.pais = 'Colombia'
-- LIMIT 50;

