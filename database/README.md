# Scripts de Base de Datos - Sistema de Compra de Tiquetes Aéreos

Este directorio contiene los scripts SQL para configurar la base de datos en Supabase.

## Estructura de Archivos

1. **01_create_tables.sql**: Script principal para crear todas las tablas, índices, triggers y funciones de la base de datos.
2. **02_insert_initial_data.sql**: Script para insertar datos iniciales (modelos de avión y ciudades).
3. **03_insert_sample_flights.sql**: Script para generar vuelos de ejemplo y asientos automáticamente.

## Orden de Ejecución

Ejecutar los scripts en el siguiente orden en Supabase:

1. **Primero**: Ejecutar `01_create_tables.sql` - Crea todas las tablas, índices, triggers y funciones
2. **Segundo**: Ejecutar `02_insert_initial_data.sql` - Inserta modelos de avión y ciudades
3. **Tercero**: Ejecutar `03_insert_sample_flights.sql` - Genera vuelos de ejemplo y asientos automáticamente

## Estructura de la Base de Datos

### Tablas Principales

- **modelos_avion**: Almacena los modelos de avión y su capacidad
- **ciudades**: Almacena las ciudades disponibles para origen y destino
- **vuelos**: Almacena los vuelos disponibles
- **asientos**: Almacena los asientos de cada vuelo
- **reservas**: Almacena las reservas realizadas
- **pasajeros**: Almacena la información de los pasajeros
- **datos_pagador**: Almacena la información del pagador
- **pagos**: Almacena los pagos simulados
- **asientos_reservados**: Relación entre pasajeros y asientos reservados
- **tiquetes**: Almacena los tiquetes electrónicos generados

## Características y Validaciones

### Seguridad y Validaciones

- ✅ **Prevención de venta duplicada de asientos**: Constraint UNIQUE + trigger de validación previa
- ✅ **Control de capacidad**: No permite exceder la capacidad del modelo de avión
- ✅ **Validación de fechas**: Solo permite vuelos desde hoy hasta 2 meses adelante
- ✅ **Validación de infantes**: Verifica que los infantes sean menores de 3 años
- ✅ **Validación de vuelos ida/regreso**: El vuelo de regreso debe ser posterior al de ida
- ✅ **Validación de cantidad de pasajeros**: Máximo 5 pasajeros por reserva

### Automatizaciones

- ✅ **Generación automática de códigos de reserva únicos** (formato: RES00000000ABCD)
- ✅ **Generación automática de códigos de tiquete únicos** (formato: TKT00000000ABCDEF)
- ✅ **Actualización automática de estados de asientos** al reservar
- ✅ **Actualización automática de estado de vuelos** cuando se alcanza capacidad
- ✅ **Liberación automática de asientos** al cancelar reservas
- ✅ **Generación automática de asientos** cuando se crea un vuelo (según capacidad del modelo)
- ✅ **Actualización automática de timestamps** (updated_at)

### Integridad de Datos

- ✅ **Constraints de integridad referencial**: Foreign keys en todas las relaciones
- ✅ **Constraints CHECK**: Validaciones a nivel de base de datos
- ✅ **Índices optimizados**: Para búsquedas rápidas

## Notas Importantes

- Los scripts están optimizados para Supabase (PostgreSQL)
- No se incluyen políticas RLS (Row Level Security) - se pueden agregar según necesidad
- Los UUID se manejan automáticamente por Supabase
- Las fechas de los vuelos de ejemplo se generan desde la fecha actual hasta 60 días adelante
