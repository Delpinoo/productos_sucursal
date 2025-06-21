-- init.sql
-- Este script se ejecutará automáticamente cuando el contenedor de PostgreSQL se inicialice por primera vez.

-- Tabla para las sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
    -- 'direccion' se elimina para coincidir con tu query original
);

-- Tabla para los productos (modificada para incluir imagen y descripcion, pero no precio global)
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen BYTEA -- Añadido 'imagen' aquí según las métricas y uso previo.
);

-- Tabla de cruce para el stock de productos en cada sucursal (con precio por sucursal)
CREATE TABLE IF NOT EXISTS stock (
    id SERIAL PRIMARY KEY,
    id_sucursal INTEGER REFERENCES sucursales(id) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 0,
    precio DECIMAL(10, 2), -- Precio por producto en esta sucursal
    UNIQUE (id_sucursal, id_producto)
);

-- Tabla para las ventas
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10, 2) NOT NULL,
    id_sucursal INTEGER REFERENCES sucursales(id) ON DELETE CASCADE
);

-- Tabla para los detalles de cada venta (qué productos se vendieron)
CREATE TABLE IF NOT EXISTS detalles_venta (
    id SERIAL PRIMARY KEY,
    id_venta INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL
);


-- Opcional: Insertamos sucursales y productos (ajustado para ON CONFLICT)
-- Solo insertará si la fila no existe para evitar errores en recreaciones de Docker
INSERT INTO sucursales (nombre) VALUES
('Sucursal Centro') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO sucursales (nombre) VALUES
('Sucursal Norte') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO sucursales (nombre) VALUES
('Sucursal Sur') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO sucursales (nombre) VALUES
('Sucursal Este') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO sucursales (nombre) VALUES
('Sucursal Oeste') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO sucursales (nombre) VALUES
('Sucursal General') ON CONFLICT (nombre) DO NOTHING; -- Asegura que la Sucursal General esté disponible

INSERT INTO productos (nombre, descripcion, imagen) VALUES
('Laptop Gamer', 'Laptop de alto rendimiento para juegos', E'\\x89504e470d0a1a0a0000000d49484452000000100000001008060000001f15c489000000017352474200aece1ce90000000467414d410000b18f0bec000000097048597300000c0100000c0101283c009b0000000c4944415478daedc10101000000c2a0f74f670000000049454e44ae426082'::bytea) ON CONFLICT (nombre) DO NOTHING;
INSERT INTO productos (nombre, descripcion, imagen) VALUES
('Monitor 27"', 'Monitor de 27 pulgadas con resolución Full HD', E'\\x89504e470d0a1a0a0000000d49484452000000100000001008060000001f15c489000000017352474200aece1ce90000000467414d410000b18f0bec000000097048597300000c0100000c0101283c009b0000000c4944415478daedc10101000000c2a0f74f670000000049454e44ae426082'::bytea) ON CONFLICT (nombre) DO NOTHING;
INSERT INTO productos (nombre, descripcion, imagen) VALUES
('Teclado Mecánico', 'Teclado mecánico retroiluminado RGB', E'\\x89504e470d0a1a0a0000000d49484452000000100000001008060000001f15c489000000017352474200aece1ce90000000467414d410000b18f0bec000000097048597300000c0100000c0101283c009b0000000c4944415478daedc10101000000c2a0f74f670000000049454e44ae426082'::bytea) ON CONFLICT (nombre) DO NOTHING;
INSERT INTO productos (nombre, descripcion, imagen) VALUES
('Mouse Inalámbrico', 'Mouse inalámbrico ergonómico con múltiples botones', E'\\x89504e470d0a1a0a0000000d49484452000000100000001008060000001f15c489000000017352474200aece1ce90000000467414d410000b18f0bec000000097048597300000c0100000c0101283c009b0000000c4944415478daedc10101000000c2a0f74f670000000049454e44ae426082'::bytea) ON CONFLICT (nombre) DO NOTHING;
INSERT INTO productos (nombre, descripcion, imagen) VALUES
('Auriculares Gaming', 'Auriculares circumaurales con micrófono', E'\\x89504e470d0a1a0a0000000d49484452000000100000001008060000001f15c489000000017352474200aece1ce90000000467414d410000b18f0bec000000097048597300000c0100000c0101283c009b0000000c4948445478daedc10101000000c2a0f74f670000000049454e44ae426082'::bytea) ON CONFLICT (nombre) DO NOTHING;

-- Insertar stock de ejemplo (ajustado para ON CONFLICT (id_sucursal, id_producto) DO UPDATE)
-- Utiliza subconsultas para obtener los IDs dinámicamente

-- Para Sucursal Centro
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Centro'), (SELECT id FROM productos WHERE nombre = 'Laptop Gamer'), 15, 1200.50) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Centro'), (SELECT id FROM productos WHERE nombre = 'Monitor 27"'), 30, 250.75) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Centro'), (SELECT id FROM productos WHERE nombre = 'Teclado Mecánico'), 20, 80.99) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Centro'), (SELECT id FROM productos WHERE nombre = 'Mouse Inalámbrico'), 40, 45.20) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Centro'), (SELECT id FROM productos WHERE nombre = 'Auriculares Gaming'), 25, 70.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;

-- Para Sucursal Norte
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Norte'), (SELECT id FROM productos WHERE nombre = 'Laptop Gamer'), 10, 1250.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Norte'), (SELECT id FROM productos WHERE nombre = 'Monitor 27"'), 25, 260.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Norte'), (SELECT id FROM productos WHERE nombre = 'Teclado Mecánico'), 15, 85.50) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Norte'), (SELECT id FROM productos WHERE nombre = 'Mouse Inalámbrico'), 35, 48.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Norte'), (SELECT id FROM productos WHERE nombre = 'Auriculares Gaming'), 18, 72.50) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;

-- Para Sucursal Sur
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Sur'), (SELECT id FROM productos WHERE nombre = 'Laptop Gamer'), 20, 1180.99) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Sur'), (SELECT id FROM productos WHERE nombre = 'Monitor 27"'), 35, 245.50) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Sur'), (SELECT id FROM productos WHERE nombre = 'Teclado Mecánico'), 22, 78.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Sur'), (SELECT id FROM productos WHERE nombre = 'Mouse Inalámbrico'), 45, 42.75) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Sur'), (SELECT id FROM productos WHERE nombre = 'Auriculares Gaming'), 30, 68.20) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;

-- Para Sucursal Este
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Este'), (SELECT id FROM productos WHERE nombre = 'Laptop Gamer'), 8, 1300.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Este'), (SELECT id FROM productos WHERE nombre = 'Monitor 27"'), 20, 270.25) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Este'), (SELECT id FROM productos WHERE nombre = 'Teclado Mecánico'), 12, 90.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Este'), (SELECT id FROM productos WHERE nombre = 'Mouse Inalámbrico'), 30, 50.50) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Este'), (SELECT id FROM productos WHERE nombre = 'Auriculares Gaming'), 15, 75.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;

-- Para Sucursal Oeste
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Oeste'), (SELECT id FROM productos WHERE nombre = 'Laptop Gamer'), 12, 1220.75) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Oeste'), (SELECT id FROM productos WHERE nombre = 'Monitor 27"'), 28, 255.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Oeste'), (SELECT id FROM productos WHERE nombre = 'Teclado Mecánico'), 18, 82.90) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Oeste'), (SELECT id FROM productos WHERE nombre = 'Mouse Inalámbrico'), 38, 46.50) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal Oeste'), (SELECT id FROM productos WHERE nombre = 'Auriculares Gaming'), 22, 71.10) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;

-- Para Sucursal General (id=6)
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal General'), (SELECT id FROM productos WHERE nombre = 'Laptop Gamer'), 100, 1220.75) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal General'), (SELECT id FROM productos WHERE nombre = 'Monitor 27"'), 228, 255.00) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal General'), (SELECT id FROM productos WHERE nombre = 'Teclado Mecánico'), 189, 82.90) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal General'), (SELECT id FROM productos WHERE nombre = 'Mouse Inalámbrico'), 380, 46.50) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
((SELECT id FROM sucursales WHERE nombre = 'Sucursal General'), (SELECT id FROM productos WHERE nombre = 'Auriculares Gaming'), 2, 71.10) ON CONFLICT (id_sucursal, id_producto) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
