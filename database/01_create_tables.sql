-- Script de creación de tablas para Sistema de Compra de Tiquetes Aéreos
-- Compatible con Supabase (PostgreSQL)
-- Fecha: 2024

-- Tabla: modelos_avion
-- Almacena los diferentes modelos de avión y su capacidad
CREATE TABLE IF NOT EXISTS modelos_avion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    capacidad_total INTEGER NOT NULL CHECK (capacidad_total > 0),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ciudades
-- Almacena las ciudades disponibles para origen y destino con autocompletado
CREATE TABLE IF NOT EXISTS ciudades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_iata VARCHAR(3) UNIQUE,
    pais VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: vuelos
-- Almacena la información de los vuelos disponibles
CREATE TABLE IF NOT EXISTS vuelos (
    id SERIAL PRIMARY KEY,
    codigo_vuelo VARCHAR(10) NOT NULL UNIQUE,
    modelo_avion_id INTEGER NOT NULL REFERENCES modelos_avion(id),
    ciudad_origen_id INTEGER NOT NULL REFERENCES ciudades(id),
    ciudad_destino_id INTEGER NOT NULL REFERENCES ciudades(id),
    fecha_salida DATE NOT NULL,
    hora_salida TIME NOT NULL,
    fecha_llegada DATE NOT NULL,
    hora_llegada TIME NOT NULL,
    precio_base DECIMAL(10, 2) NOT NULL CHECK (precio_base >= 0),
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'completo', 'cancelado')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (ciudad_origen_id != ciudad_destino_id),
    CHECK (fecha_salida <= fecha_llegada),
    CHECK (fecha_salida >= CURRENT_DATE),
    CHECK (fecha_salida <= CURRENT_DATE + INTERVAL '2 months')
);

-- Tabla: asientos
-- Almacena los asientos de cada vuelo con su estado
CREATE TABLE IF NOT EXISTS asientos (
    id SERIAL PRIMARY KEY,
    vuelo_id INTEGER NOT NULL REFERENCES vuelos(id) ON DELETE CASCADE,
    numero_asiento VARCHAR(10) NOT NULL,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'ocupado')),
    tipo_asiento VARCHAR(20) DEFAULT 'economica' CHECK (tipo_asiento IN ('economica', 'ejecutiva', 'primera_clase')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vuelo_id, numero_asiento)
);

-- Tabla: reservas
-- Almacena las reservas realizadas
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE,
    vuelo_ida_id INTEGER NOT NULL REFERENCES vuelos(id),
    vuelo_regreso_id INTEGER REFERENCES vuelos(id),
    tipo_viaje VARCHAR(20) NOT NULL CHECK (tipo_viaje IN ('solo_ida', 'ida_regreso')),
    cantidad_pasajeros INTEGER NOT NULL CHECK (cantidad_pasajeros > 0 AND cantidad_pasajeros <= 5),
    CHECK ((tipo_viaje = 'ida_regreso' AND vuelo_regreso_id IS NOT NULL) OR 
           (tipo_viaje = 'solo_ida' AND vuelo_regreso_id IS NULL)),
    CHECK (vuelo_ida_id != vuelo_regreso_id OR vuelo_regreso_id IS NULL),
    valor_total DECIMAL(10, 2) NOT NULL CHECK (valor_total >= 0),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'pagada')),
    acepto_terminos BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: pasajeros
-- Almacena la información de los pasajeros
CREATE TABLE IF NOT EXISTS pasajeros (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    primer_apellido VARCHAR(100) NOT NULL,
    segundo_apellido VARCHAR(100),
    nombres VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL CHECK (genero IN ('masculino', 'femenino', 'otro')),
    tipo_documento VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('cedula', 'pasaporte', 'tarjeta_identidad', 'otro')),
    numero_documento VARCHAR(50) NOT NULL,
    es_infante BOOLEAN DEFAULT false,
    celular VARCHAR(20),
    correo_electronico VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: datos_pagador
-- Almacena la información del pagador
CREATE TABLE IF NOT EXISTS datos_pagador (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('cedula', 'pasaporte', 'tarjeta_identidad', 'otro')),
    numero_documento VARCHAR(50) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: pagos
-- Almacena la información de los pagos simulados
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id) ON DELETE CASCADE,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('tarjeta_credito', 'tarjeta_debito', 'pse')),
    numero_tarjeta_masked VARCHAR(20),
    valor_pagado DECIMAL(10, 2) NOT NULL CHECK (valor_pagado >= 0),
    estado_pago VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
    respuesta_pago TEXT,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: asientos_reservados
-- Relación muchos a muchos entre pasajeros y asientos reservados
CREATE TABLE IF NOT EXISTS asientos_reservados (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    pasajero_id INTEGER NOT NULL REFERENCES pasajeros(id) ON DELETE CASCADE,
    asiento_id INTEGER NOT NULL REFERENCES asientos(id) ON DELETE CASCADE,
    vuelo_id INTEGER NOT NULL REFERENCES vuelos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asiento_id, reserva_id)
);

-- Tabla: tiquetes
-- Almacena los tiquetes electrónicos generados
CREATE TABLE IF NOT EXISTS tiquetes (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id) ON DELETE CASCADE,
    codigo_tiquete VARCHAR(50) NOT NULL UNIQUE,
    contenido_json JSONB,
    pdf_path VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'generado' CHECK (estado IN ('generado', 'enviado', 'cancelado')),
    fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_vuelos_origen_destino ON vuelos(ciudad_origen_id, ciudad_destino_id);
CREATE INDEX IF NOT EXISTS idx_vuelos_fecha_salida ON vuelos(fecha_salida);
CREATE INDEX IF NOT EXISTS idx_vuelos_estado ON vuelos(estado);
CREATE INDEX IF NOT EXISTS idx_asientos_vuelo ON asientos(vuelo_id);
CREATE INDEX IF NOT EXISTS idx_asientos_estado ON asientos(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_pasajeros_reserva ON pasajeros(reserva_id);
CREATE INDEX IF NOT EXISTS idx_asientos_reservados_reserva ON asientos_reservados(reserva_id);
CREATE INDEX IF NOT EXISTS idx_asientos_reservados_asiento ON asientos_reservados(asiento_id);
CREATE INDEX IF NOT EXISTS idx_ciudades_nombre ON ciudades(nombre);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_modelos_avion_updated_at BEFORE UPDATE ON modelos_avion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vuelos_updated_at BEFORE UPDATE ON vuelos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asientos_updated_at BEFORE UPDATE ON asientos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar que un infante sea menor de 3 años
CREATE OR REPLACE FUNCTION validate_infante()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_infante = true AND (CURRENT_DATE - NEW.fecha_nacimiento) >= INTERVAL '3 years' THEN
        RAISE EXCEPTION 'Un infante debe ser menor de 3 años';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_pasajero_infante BEFORE INSERT OR UPDATE ON pasajeros
    FOR EACH ROW EXECUTE FUNCTION validate_infante();

-- Función para generar código de reserva único
CREATE OR REPLACE FUNCTION generate_codigo_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_reserva IS NULL OR NEW.codigo_reserva = '' THEN
        NEW.codigo_reserva := 'RES' || LPAD(NEXTVAL('reservas_id_seq')::TEXT, 8, '0') || 
                             UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_reserva_codigo BEFORE INSERT ON reservas
    FOR EACH ROW EXECUTE FUNCTION generate_codigo_reserva();

-- Función para generar código de tiquete único
CREATE OR REPLACE FUNCTION generate_codigo_tiquete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_tiquete IS NULL OR NEW.codigo_tiquete = '' THEN
        NEW.codigo_tiquete := 'TKT' || LPAD(NEXTVAL('tiquetes_id_seq')::TEXT, 8, '0') || 
                             UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_tiquete_codigo BEFORE INSERT ON tiquetes
    FOR EACH ROW EXECUTE FUNCTION generate_codigo_tiquete();

-- Función para actualizar estado del asiento cuando se reserva
CREATE OR REPLACE FUNCTION update_asiento_on_reserve()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE asientos 
    SET estado = 'reservado', updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.asiento_id;
    
    -- Verificar que el vuelo no exceda su capacidad
    IF (SELECT COUNT(*) FROM asientos_reservados ar 
        JOIN asientos a ON ar.asiento_id = a.id 
        WHERE a.vuelo_id = NEW.vuelo_id AND a.estado IN ('reservado', 'ocupado')) 
        >= (SELECT capacidad_total FROM modelos_avion ma 
            JOIN vuelos v ON ma.id = v.modelo_avion_id 
            WHERE v.id = NEW.vuelo_id) THEN
        UPDATE vuelos SET estado = 'completo', updated_at = CURRENT_TIMESTAMP WHERE id = NEW.vuelo_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_asiento_when_reserved AFTER INSERT ON asientos_reservados
    FOR EACH ROW EXECUTE FUNCTION update_asiento_on_reserve();

-- Función para liberar asiento cuando se cancela una reserva
CREATE OR REPLACE FUNCTION release_asiento_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'cancelada' AND OLD.estado != 'cancelada' THEN
        UPDATE asientos 
        SET estado = 'disponible', updated_at = CURRENT_TIMESTAMP
        WHERE id IN (
            SELECT asiento_id FROM asientos_reservados WHERE reserva_id = NEW.id
        );
        
        -- Actualizar estado del vuelo si vuelve a tener capacidad
        UPDATE vuelos 
        SET estado = 'disponible', updated_at = CURRENT_TIMESTAMP
        WHERE id IN (SELECT vuelo_id FROM asientos_reservados WHERE reserva_id = NEW.id)
        AND estado = 'completo';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER release_asiento_on_reserva_cancel AFTER UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION release_asiento_on_cancel();

-- Función para validar que no se pueda reservar un asiento ya reservado
CREATE OR REPLACE FUNCTION validate_asiento_disponible()
RETURNS TRIGGER AS $$
DECLARE
    asiento_estado VARCHAR(20);
    vuelo_capacidad INTEGER;
    asientos_reservados_count INTEGER;
BEGIN
    -- Verificar el estado actual del asiento
    SELECT estado INTO asiento_estado
    FROM asientos
    WHERE id = NEW.asiento_id;
    
    -- Si el asiento ya está reservado u ocupado, lanzar error
    IF asiento_estado IN ('reservado', 'ocupado') THEN
        RAISE EXCEPTION 'El asiento % ya está reservado u ocupado', (SELECT numero_asiento FROM asientos WHERE id = NEW.asiento_id);
    END IF;
    
    -- Verificar capacidad del vuelo antes de reservar
    SELECT capacidad_total INTO vuelo_capacidad
    FROM modelos_avion ma
    JOIN vuelos v ON ma.id = v.modelo_avion_id
    WHERE v.id = NEW.vuelo_id;
    
    -- Contar asientos ya reservados del vuelo
    SELECT COUNT(*) INTO asientos_reservados_count
    FROM asientos_reservados ar
    JOIN asientos a ON ar.asiento_id = a.id
    WHERE a.vuelo_id = NEW.vuelo_id;
    
    -- Si ya se alcanzó la capacidad, lanzar error
    IF asientos_reservados_count >= vuelo_capacidad THEN
        RAISE EXCEPTION 'El vuelo ha alcanzado su capacidad máxima de % asientos', vuelo_capacidad;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_asiento_before_reserve BEFORE INSERT ON asientos_reservados
    FOR EACH ROW EXECUTE FUNCTION validate_asiento_disponible();

-- Función para validar que las fechas de vuelos estén en el rango permitido (hoy hasta 2 meses adelante)
CREATE OR REPLACE FUNCTION validate_fecha_vuelo()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que la fecha de salida no sea en el pasado
    IF NEW.fecha_salida < CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha de salida no puede ser anterior a hoy';
    END IF;
    
    -- Validar que la fecha de salida no sea más de 2 meses en el futuro
    IF NEW.fecha_salida > (CURRENT_DATE + INTERVAL '2 months') THEN
        RAISE EXCEPTION 'La fecha de salida no puede ser más de 2 meses en el futuro';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_vuelo_fecha BEFORE INSERT OR UPDATE ON vuelos
    FOR EACH ROW EXECUTE FUNCTION validate_fecha_vuelo();

-- Función para validar que el vuelo de regreso sea posterior al vuelo de ida
CREATE OR REPLACE FUNCTION validate_vuelo_regreso()
RETURNS TRIGGER AS $$
DECLARE
    vuelo_ida_fecha_llegada DATE;
    vuelo_ida_hora_llegada TIME;
    vuelo_regreso_fecha_salida DATE;
    vuelo_regreso_hora_salida TIME;
BEGIN
    -- Si es ida_regreso, validar que el vuelo de regreso sea posterior al vuelo de ida
    IF NEW.tipo_viaje = 'ida_regreso' AND NEW.vuelo_regreso_id IS NOT NULL THEN
        -- Obtener fecha y hora de llegada del vuelo de ida
        SELECT fecha_llegada, hora_llegada 
        INTO vuelo_ida_fecha_llegada, vuelo_ida_hora_llegada
        FROM vuelos WHERE id = NEW.vuelo_ida_id;
        
        IF vuelo_ida_fecha_llegada IS NULL THEN
            RAISE EXCEPTION 'El vuelo de ida no existe';
        END IF;
        
        -- Obtener fecha y hora de salida del vuelo de regreso
        SELECT fecha_salida, hora_salida
        INTO vuelo_regreso_fecha_salida, vuelo_regreso_hora_salida
        FROM vuelos WHERE id = NEW.vuelo_regreso_id;
        
        IF vuelo_regreso_fecha_salida IS NULL THEN
            RAISE EXCEPTION 'El vuelo de regreso no existe';
        END IF;
        
        -- Verificar que el vuelo de regreso salga después del vuelo de ida
        IF vuelo_regreso_fecha_salida < vuelo_ida_fecha_llegada OR
           (vuelo_regreso_fecha_salida = vuelo_ida_fecha_llegada AND 
            vuelo_regreso_hora_salida <= vuelo_ida_hora_llegada) THEN
            RAISE EXCEPTION 'El vuelo de regreso debe salir después del vuelo de ida';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_reserva_vuelos BEFORE INSERT OR UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION validate_vuelo_regreso();

-- Función para validar que el número de pasajeros registrados coincida con cantidad_pasajeros
CREATE OR REPLACE FUNCTION validate_cantidad_pasajeros()
RETURNS TRIGGER AS $$
DECLARE
    cantidad_pasajeros_registrados INTEGER;
BEGIN
    -- Contar pasajeros registrados para esta reserva
    SELECT COUNT(*) INTO cantidad_pasajeros_registrados
    FROM pasajeros
    WHERE reserva_id = NEW.reserva_id;
    
    -- Verificar que no exceda la cantidad de pasajeros permitidos
    IF cantidad_pasajeros_registrados > (SELECT cantidad_pasajeros FROM reservas WHERE id = NEW.reserva_id) THEN
        RAISE EXCEPTION 'El número de pasajeros registrados excede la cantidad permitida en la reserva';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_pasajero_count AFTER INSERT OR UPDATE ON pasajeros
    FOR EACH ROW EXECUTE FUNCTION validate_cantidad_pasajeros();

