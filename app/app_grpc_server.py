    import grpc
    from concurrent import futures
    import time
    import os
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    import logging

    # Configuración de logging
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(levelname)s - %(message)s')

    # Importa los módulos generados por protobuf
    import app.productos_pb2 as productos_pb2
    import app.productos_pb2_grpc as productos_pb2_grpc
    import google.protobuf.empty_pb2 as empty_pb2

    # Configuración de la base de datos
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'productos_db')
    DB_USER = os.getenv('DB_USER', 'user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    DB_PORT = os.getenv('DB_PORT', '5432')

    def get_db_connection():
        """Establece y retorna una conexión a la base de datos."""
        conn = None
        retries = 10 # Aumentar reintentos para dar más tiempo a la DB
        retry_delay = 3 # Retraso de 3 segundos entre reintentos
        while retries > 0:
            try:
                logging.info(f"Intentando conectar a la base de datos en {DB_HOST}:{DB_PORT}/{DB_NAME}...")
                conn = psycopg2.connect(
                    host=DB_HOST,
                    database=DB_NAME,
                    user=DB_USER,
                    password=DB_PASSWORD,
                    port=DB_PORT
                )
                logging.info("Conexión a la base de datos exitosa.")
                return conn
            except psycopg2.OperationalError as e:
                logging.error(f"Error al conectar a la base de datos: {e}")
                retries -= 1
                if retries > 0:
                    logging.info(f"Reintentando en {retry_delay} segundos... ({retries} intentos restantes)")
                    time.sleep(retry_delay)
                else:
                    logging.error("No se pudo conectar a la base de datos después de varios intentos.")
                    raise
            return conn

    def create_database_and_table():
        """Crea la base de datos y la tabla de productos si no existen."""
        # Conectar a la base de datos por defecto (postgres) para crear la nueva DB
        conn_no_db = None
        # Mismos reintentos que para la conexión general
        retries = 10
        retry_delay = 3
        while retries > 0:
            try:
                logging.info(f"Intentando conectar a PostgreSQL en {DB_HOST}:{DB_PORT} para crear la base de datos {DB_NAME}...")
                conn_no_db = psycopg2.connect(
                    host=DB_HOST,
                    database='postgres',
                    user=DB_USER,
                    password=DB_PASSWORD,
                    port=DB_PORT
                )
                conn_no_db.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                cursor_no_db = conn_no_db.cursor()

                # Verificar si la base de datos existe
                cursor_no_db.execute(sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"), [DB_NAME])
                if not cursor_no_db.fetchone():
                    logging.info(f"Creando la base de datos: {DB_NAME}")
                    cursor_no_db.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
                    logging.info(f"Base de datos {DB_NAME} creada exitosamente.")
                else:
                    logging.info(f"La base de datos {DB_NAME} ya existe.")

                cursor_no_db.close()
                break # Salir del bucle si la conexión es exitosa
            except psycopg2.OperationalError as e:
                logging.error(f"Error al conectar a PostgreSQL para crear la base de datos: {e}")
                retries -= 1
                if retries > 0:
                    logging.info(f"Reintentando en {retry_delay} segundos... ({retries} intentos restantes)")
                    time.sleep(retry_delay)
                else:
                    logging.error("No se pudo conectar a PostgreSQL para crear la base de datos después de varios intentos.")
                    raise
            finally:
                if conn_no_db:
                    conn_no_db.close()

        # Conectar a la base de datos específica para crear la tabla y sembrar datos
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # Crear la tabla si no existe
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS productos (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(255) NOT NULL,
                    descripcion TEXT,
                    precio DECIMAL(10, 2) NOT NULL,
                    stock INTEGER NOT NULL
                );
            """)
            conn.commit()
            logging.info("Tabla 'productos' verificada/creada exitosamente.")

            # Verificar si la tabla está vacía y sembrar datos si es necesario
            cursor.execute("SELECT COUNT(*) FROM productos;")
            if cursor.fetchone()[0] == 0:
                logging.info("Sembrando datos iniciales en la tabla 'productos'...")
                cursor.execute("""
                    INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
                    ('Laptop Dell XPS 15', 'Potente laptop con pantalla InfinityEdge', 1800.00, 50),
                    ('Monitor Ultrawide LG', 'Monitor de 34 pulgadas para productividad', 450.00, 120),
                    ('Teclado Mecánico HyperX', 'Teclado para gaming con switches rojos', 120.00, 200),
                    ('Mouse Logitech MX Master 3', 'Mouse ergonómico avanzado para profesionales', 99.99, 150),
                    ('Auriculares Sony WH-1000XM4', 'Auriculares con cancelación de ruido líder', 279.00, 80);
                """)
                conn.commit()
                logging.info("Datos iniciales sembrados exitosamente.")
            else:
                logging.info("La tabla 'productos' ya contiene datos, no se sembrarán datos iniciales.")

        except Exception as e:
            logging.error(f"Error al crear tabla o sembrar datos: {e}")
            conn.rollback()
            raise
        finally:
            cursor.close()
            conn.close()

    class ProductosService(productos_pb2_grpc.ProductosServiceServicer):
        """Implementa los métodos del servicio gRPC de productos."""

        def GetProducto(self, request, context):
            conn = get_db_connection()
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT id, nombre, descripcion, precio, stock FROM productos WHERE id = %s", (request.id,))
                row = cursor.fetchone()
                if row:
                    logging.info(f"Producto encontrado: ID {row[0]}, Nombre {row[1]}")
                    return productos_pb2.Producto(
                        id=row[0],
                        nombre=row[1],
                        descripcion=row[2],
                        precio=float(row[3]),
                        stock=row[4]
                    )
                else:
                    logging.warning(f"Producto no encontrado: ID {request.id}")
                    context.set_details('Producto no encontrado')
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    return productos_pb2.Producto()
            except Exception as e:
                logging.error(f"Error al obtener producto: {e}")
                context.set_details(f'Error interno del servidor: {e}')
                context.set_code(grpc.StatusCode.INTERNAL)
                return productos_pb2.Producto()
            finally:
                cursor.close()
                conn.close()

        def SearchProductos(self, request, context):
            conn = get_db_connection()
            cursor = conn.cursor()
            try:
                query = "SELECT id, nombre, descripcion, precio, stock FROM productos WHERE nombre ILIKE %s OR descripcion ILIKE %s"
                search_term = f"%{request.query}%"
                cursor.execute(query, (search_term, search_term))
                rows = cursor.fetchall()
                productos = []
                for row in rows:
                    productos.append(productos_pb2.Producto(
                        id=row[0],
                        nombre=row[1],
                        descripcion=row[2],
                        precio=float(row[3]),
                        stock=row[4]
                    ))
                logging.info(f"Búsqueda de productos '{request.query}' completada, {len(productos)} resultados.")
                return productos_pb2.SearchProductosResponse(productos=productos)
            except Exception as e:
                logging.error(f"Error al buscar productos: {e}")
                context.set_details(f'Error interno del servidor: {e}')
                context.set_code(grpc.StatusCode.INTERNAL)
                return productos_pb2.SearchProductosResponse()
            finally:
                cursor.close()
                conn.close()

        def CreateProducto(self, request, context):
            conn = get_db_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    """INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (%s, %s, %s, %s) RETURNING id;""",
                    (request.nombre, request.descripcion, request.precio, request.stock)
                )
                producto_id = cursor.fetchone()[0]
                conn.commit()
                logging.info(f"Producto creado: ID {producto_id}, Nombre {request.nombre}")
                return productos_pb2.Producto(
                    id=producto_id,
                    nombre=request.nombre,
                    descripcion=request.descripcion,
                    precio=request.precio,
                    stock=request.stock
                )
            except Exception as e:
                logging.error(f"Error al crear producto: {e}")
                context.set_details(f'Error interno del servidor: {e}')
                context.set_code(grpc.StatusCode.INTERNAL)
                return productos_pb2.Producto()
            finally:
                cursor.close()
                conn.close()

        def UpdateProducto(self, request, context):
            conn = get_db_connection()
            cursor = conn.cursor()
            try:
                cursor.execute(
                    """UPDATE productos SET nombre = %s, descripcion = %s, precio = %s, stock = %s WHERE id = %s RETURNING id;""",
                    (request.nombre, request.descripcion, request.precio, request.stock, request.id)
                )
                if cursor.rowcount == 0:
                    logging.warning(f"Producto no encontrado para actualizar: {request.id}")
                    context.set_details('Producto no encontrado')
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    return productos_pb2.Producto()
                conn.commit()
                logging.info(f"Producto actualizado: ID {request.id}, Nombre {request.nombre}")
                return request
            except Exception as e:
                logging.error(f"Error al actualizar producto: {e}")
                context.set_details(f'Error interno del servidor: {e}')
                context.set_code(grpc.StatusCode.INTERNAL)
                return productos_pb2.Producto()
            finally:
                cursor.close()
                conn.close()

        def DeleteProducto(self, request, context):
            conn = get_db_connection()
            cursor = conn.cursor()
            try:
                cursor.execute("DELETE FROM productos WHERE id = %s RETURNING id;", (request.id,))
                if cursor.rowcount == 0:
                    logging.warning(f"Producto no encontrado para eliminar: {request.id}")
                    context.set_details('Producto no encontrado')
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    return empty_pb2.Empty()
                conn.commit()
                logging.info(f"Producto eliminado: ID {request.id}")
                return empty_pb2.Empty()
            except Exception as e:
                logging.error(f"Error al eliminar producto: {e}")
                context.set_details(f'Error interno del servidor: {e}')
                context.set_code(grpc.StatusCode.INTERNAL)
                return empty_pb2.Empty()
            finally:
                cursor.close()
                conn.close()

    def serve():
        # Primero, asegúrate de que la base de datos y la tabla existan y estén sembradas
        logging.info("Iniciando proceso de creación de base de datos y tabla...")
        try:
            create_database_and_table()
            logging.info("Base de datos y tabla preparadas.")
        except Exception as e:
            logging.critical(f"Fallo crítico al preparar la base de datos: {e}")
            raise

        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        productos_pb2_grpc.add_ProductosServiceServicer_to_server(ProductosService(), server)
        server.add_insecure_port('[::]:50051')
        logging.info("Servidor gRPC escuchando en el puerto 50051...")
        server.start()
        try:
            while True:
                time.sleep(86400)
        except KeyboardInterrupt:
            logging.info("Deteniendo servidor gRPC.")
            server.stop(0)

    if __name__ == '__main__':
        serve()
    