import psycopg2
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

def get_db_connection():
    """
    Establece y devuelve una conexión a la base de datos PostgreSQL.
    """
    try:
        hostname = os.environ.get('DB_HOST')
        database = os.environ.get('DB_NAME')
        username = os.environ.get('DB_USER')
        password = os.environ.get('DB_PASSWORD')
        port = os.environ.get('DB_PORT', '5432')

        conn = psycopg2.connect(
            host=hostname,
            database=database,
            user=username,
            password=password,
            port=port
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

def seed_database():
    """
    Resetea y siembra la base de datos con datos iniciales de productos y stock.
    """
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            # --- Paso 1: Eliminar datos existentes (opcional, para un reseteo completo) ---
            # ¡CUIDADO! Esto borrará todos los datos de estas tablas.
            print("Borrando datos existentes de stock, detalles_venta, ventas, productos, sucursales...")
            cur.execute("DELETE FROM stock;")
            cur.execute("DELETE FROM detalles_venta;")
            cur.execute("DELETE FROM ventas;")
            cur.execute("DELETE FROM productos;")
            cur.execute("DELETE FROM sucursales;")
            conn.commit()
            print("Datos existentes borrados.")

            # --- Paso 2: Insertar Sucursales ---
            print("Insertando sucursales...")
            sucursales_data = [
                (1, 'Sucursal Centro'),
                (2, 'Sucursal Norte'),
                (3, 'Sucursal Sur'),
                (4, 'Sucursal Este'),
                (5, 'Sucursal Oeste'),
                (6, 'Sucursal Casa Matriz')
            ]
            cur.executemany("INSERT INTO sucursales (id, nombre) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING;", sucursales_data)
            conn.commit()
            print("Sucursales insertadas.")

            # --- Paso 3: Insertar Productos (con los datos que proporcionaste) ---
            print("Insertando productos...")
            productos_data = [
                (1, 'Teclado Mecánico', 'Teclado RGB con switches azules'),
                (2, 'Mouse Gamer', 'Mouse ergonómico con alta precisión'),
                (3, 'Monitor Curvo', 'Monitor de 27 pulgadas, 144Hz'),
                (4, 'Auriculares Gaming', 'Auriculares con micrófono y sonido envolvente'),
                (5, 'Webcam HD', 'Cámara web 1080p para streaming')
            ]
            cur.executemany("INSERT INTO productos (id, nombre, descripcion) VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING;", productos_data)
            conn.commit()
            print("Productos insertados.")

            # --- Paso 4: Insertar Stock Inicial (con los datos que proporcionaste) ---
            print("Insertando stock inicial...")
            stock_data = [
                # Producto 1: Teclado Mecánico
                (1, 1, 10, 50.00),  # id_producto, id_sucursal, cantidad, precio
                (1, 2, 5, 52.00),
                (1, 3, 12, 888.00),
                (1, 4, 12, 4252.00),
                (1, 5, 12, 2222.00),
                # Producto 2: Mouse Gamer
                (2, 1, 15, 25.00),
                (2, 2, 8, 26.50),
                (2, 3, 8, 2699.50),
                (2, 4, 8, 891.50),
                (2, 5, 8, 10.50),
                # Producto 3: Monitor Curvo
                (3, 1, 7, 300.00),
                (3, 2, 10, 295.00),
                (3, 3, 10, 295.00),
                (3, 4, 10, 295.00),
                (3, 5, 10, 295.00),
                # Producto 4: Auriculares Gaming
                (4, 1, 20, 75.00),
                (4, 2, 10, 78.00),
                (4, 3, 18, 7299.00),
                (4, 4, 18, 2318.00),
                (4, 5, 18, 16.00),
                # Producto 5: Webcam HD
                (5, 1, 8, 40.00),
                (5, 2, 5, 402.00),
                (5, 3, 5, 326.00),
                (5, 4, 5, 888.00),
                (5, 5, 5, 999.00),
            ]
            # Usar ON CONFLICT para actualizar si el stock ya existe para esa combinación producto-sucursal
            cur.executemany("""
                INSERT INTO stock (id_producto, id_sucursal, cantidad, precio)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id_producto, id_sucursal) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
            """, stock_data)
            conn.commit()
            print("Stock inicial insertado/actualizado.")

            print("\n¡Base de datos sembrada exitosamente!")

        except psycopg2.Error as e:
            conn.rollback()
            print(f"Error al sembrar la base de datos: {e}")
        finally:
            cur.close()
            conn.close()
    else:
        print("No se pudo establecer conexión con la base de datos para el sembrado.")

if __name__ == '__main__':
    seed_database()
