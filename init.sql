-- init.sql
-- Este script se ejecutará automáticamente cuando el contenedor de PostgreSQL se inicialice por primera vez.

-- Crear la tabla 'productos' si no existe
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DOUBLE PRECISION NOT NULL,
    imagen BYTEA -- BYTEA para almacenar datos binarios (imágenes)
);

-- Opcional: Insertar algunos datos de ejemplo si la tabla está vacía (para pruebas)
-- ON CONFLICT (id) DO NOTHING; previene errores si los IDs ya existen
INSERT INTO productos (nombre, precio, imagen) VALUES
('Teclado Mecánico', 75.50, '\x01020304'),
('Mouse Gamer', 35.00, '\x05060708'),
('Monitor Curvo', 299.99, '\x090a0b0c')
ON CONFLICT DO NOTHING; -- Aplicado a todo el conjunto de columnas
