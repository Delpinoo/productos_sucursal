-- Tabla para las sucursales
CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    -- Puedes agregar más campos como dirección, etc.
    UNIQUE (nombre)
);

-- Tabla para los productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    -- Puedes agregar más campos como código de barras, etc.
    UNIQUE (nombre)
);

-- Tabla de cruce para el stock de productos en cada sucursal
CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    id_sucursal INTEGER REFERENCES sucursales(id),
    id_producto INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL DEFAULT 0,
    precio DECIMAL(10, 2),
    UNIQUE (id_sucursal, id_producto) -- Asegura que un producto solo exista una vez por sucursal
);

-- Tabla para las ventas
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10, 2) NOT NULL,
    -- Puedes agregar información del cliente, etc.
    id_sucursal INTEGER REFERENCES sucursales(id)
);

-- Tabla para los detalles de cada venta (qué productos se vendieron)
CREATE TABLE detalles_venta (
    id SERIAL PRIMARY KEY,
    id_venta INTEGER REFERENCES ventas(id),
    id_producto INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL
);




--Insertamos sucursales y productos:

INSERT INTO sucursales (nombre) VALUES
('Sucursal Centro'),
('Sucursal Norte'),
('Sucursal Sur'),
('Sucursal Este'),
('Sucursal Oeste');

-- Puedes verificar que se insertaron las sucursales con:
-- SELECT * FROM sucursales;

INSERT INTO productos (nombre, descripcion) VALUES
('Laptop Gamer', 'Laptop de alto rendimiento para juegos'),
('Monitor 27"', 'Monitor de 27 pulgadas con resolución Full HD'),
('Teclado Mecánico', 'Teclado mecánico retroiluminado RGB'),
('Mouse Inalámbrico', 'Mouse inalámbrico ergonómico con múltiples botones'),
('Auriculares Gaming', 'Auriculares circumaurales con micrófono');

-- Puedes verificar que se insertaron los productos con:
-- SELECT * FROM productos;


-- Para Sucursal Centro (id=1)
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
(1, 1, 15, 1200.50), -- Laptop Gamer
(1, 2, 30, 250.75),  -- Monitor 27"
(1, 3, 20, 80.99),   -- Teclado Mecánico
(1, 4, 40, 45.20),   -- Mouse Inalámbrico
(1, 5, 25, 70.00);   -- Auriculares Gaming

-- Para Sucursal Norte (id=2)
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
(2, 1, 10, 1250.00), -- Laptop Gamer (precio diferente)
(2, 2, 25, 260.00),  -- Monitor 27" (precio diferente)
(2, 3, 15, 85.50),   -- Teclado Mecánico (precio diferente)
(2, 4, 35, 48.00),   -- Mouse Inalámbrico (precio diferente)
(2, 5, 18, 72.50);   -- Auriculares Gaming (precio diferente)

-- Para Sucursal Sur (id=3)
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
(3, 1, 20, 1180.99),
(3, 2, 35, 245.50),
(3, 3, 22, 78.00),
(3, 4, 45, 42.75),
(3, 5, 30, 68.20);

-- Para Sucursal Este (id=4)
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
(4, 1, 8, 1300.00),
(4, 2, 20, 270.25),
(4, 3, 12, 90.00),
(4, 4, 30, 50.50),
(4, 5, 15, 75.00);

-- Para Sucursal Oeste (id=5)
INSERT INTO stock (id_sucursal, id_producto, cantidad, precio) VALUES
(5, 1, 12, 1220.75),
(5, 2, 28, 255.00),
(5, 3, 18, 82.90),
(5, 4, 38, 46.50),
(5, 5, 22, 71.10);

-- Puedes verificar que se insertó el stock con:
-- SELECT * FROM stock;


