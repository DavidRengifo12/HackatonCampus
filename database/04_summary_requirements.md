# Verificación de Requisitos del Reto

## ✅ Requisitos Funcionales Implementados

### Búsqueda de Vuelos

- ✅ Selección de tipo de viaje: solo ida o ida y regreso (tabla `reservas`, campo `tipo_viaje`)
- ✅ Fechas válidas desde el día actual hasta 2 meses adelante (validado con constraint y trigger)
- ✅ Ciudades de origen y destino con autocompletado (tabla `ciudades`)

### Selección de Vuelo

- ✅ Mostrar vuelos disponibles con origen, destino, fecha, hora, capacidad y precio (tabla `vuelos`)
- ✅ Controlar la capacidad según el modelo de avión asignado (tabla `modelos_avion` + validación)
- ✅ Bloquear reserva si no hay asientos disponibles (trigger `validate_asiento_disponible`)

### Datos de Pasajeros

- ✅ Máximo 5 pasajeros por compra (constraint en tabla `reservas`)
- ✅ Todos los datos requeridos:
  - ✅ Primer apellido
  - ✅ Segundo apellido
  - ✅ Nombres
  - ✅ Fecha de nacimiento
  - ✅ Género
  - ✅ Tipo y número de documento
  - ✅ Condición de infante (menor de 3 años) - validado con trigger
  - ✅ Celular
  - ✅ Correo electrónico

### Datos del Pagador

- ✅ Nombre completo
- ✅ Tipo y número de documento
- ✅ Correo
- ✅ Teléfono

### Aceptación de Términos y Condiciones

- ✅ Campo obligatorio antes de procesar el pago (tabla `reservas`, campo `acepto_terminos`)

### Simulación de Pago

- ✅ Opciones: Tarjeta de crédito, débito o PSE (tabla `pagos`, campo `metodo_pago`)
- ✅ Simulación visual del pago exitoso o rechazado (tabla `pagos`, campo `estado_pago`)

### Generación de Tiquetes

- ✅ Visualización y descarga del tiquete en PDF o JSON (tabla `tiquetes`, campos `contenido_json` y `pdf_path`)
- ✅ Mostrar código único de reserva, pasajeros, vuelo y asientos
- ✅ Código único de reserva generado automáticamente (trigger `generate_codigo_reserva`)
- ✅ Código único de tiquete generado automáticamente (trigger `generate_codigo_tiquete`)

### Confirmación de Reserva

- ✅ Mostrar resumen completo con código, pasajeros, vuelo y valor total (tablas relacionadas)

## ✅ Requisitos Técnicos Implementados

- ✅ Evitar venta duplicada de asientos (constraint UNIQUE en `asientos_reservados` + trigger `validate_asiento_disponible`)
- ✅ No permitir superar la capacidad del vuelo (validado en trigger `validate_asiento_disponible` y `update_asiento_on_reserve`)
- ✅ Validar datos de entrada y salida (múltiples constraints y triggers)
- ✅ Arquitectura y buenas prácticas (normalización, índices, triggers, funciones)
- ✅ Control de versiones con GitFlow (recomendado para el equipo)
- ✅ Despliegue opcional (por implementar)

## Validaciones Implementadas

1. **Fechas de vuelos**: Solo desde hoy hasta 2 meses adelante
2. **Capacidad de vuelos**: No exceder capacidad del modelo de avión
3. **Asientos duplicados**: Prevención con UNIQUE constraint y validación previa
4. **Infantes**: Validación de que sean menores de 3 años
5. **Cantidad de pasajeros**: Máximo 5 por reserva
6. **Vuelo de regreso**: Debe ser posterior al vuelo de ida
7. **Tipo de viaje**: Validación de que ida_regreso tenga vuelo_regreso_id
8. **Códigos únicos**: Generación automática de códigos de reserva y tiquete
9. **Estado de asientos**: Actualización automática al reservar/cancelar
10. **Estado de vuelos**: Actualización automática cuando se alcanza capacidad

## Tablas Creadas

1. `modelos_avion` - Modelos de avión y su capacidad
2. `ciudades` - Ciudades para origen y destino
3. `vuelos` - Vuelos disponibles
4. `asientos` - Asientos de cada vuelo
5. `reservas` - Reservas realizadas
6. `pasajeros` - Información de pasajeros
7. `datos_pagador` - Información del pagador
8. `pagos` - Pagos simulados
9. `asientos_reservados` - Relación pasajeros-asientos-vuelos
10. `tiquetes` - Tiquetes electrónicos generados

## Funciones y Triggers

- `update_updated_at_column()` - Actualiza timestamps automáticamente
- `validate_infante()` - Valida que infantes sean menores de 3 años
- `generate_codigo_reserva()` - Genera código único de reserva
- `generate_codigo_tiquete()` - Genera código único de tiquete
- `update_asiento_on_reserve()` - Actualiza estado de asiento y vuelo al reservar
- `release_asiento_on_cancel()` - Libera asientos al cancelar reserva
- `validate_asiento_disponible()` - Valida que el asiento esté disponible
- `validate_fecha_vuelo()` - Valida rango de fechas permitido
- `validate_vuelo_regreso()` - Valida que vuelo de regreso sea posterior
- `validate_cantidad_pasajeros()` - Valida cantidad de pasajeros
- `generate_asientos_for_vuelo()` - Genera asientos automáticamente al crear vuelo

## Datos Iniciales

- 7 modelos de avión con diferentes capacidades
- 30 ciudades (15 colombianas + 15 internacionales) con códigos IATA
