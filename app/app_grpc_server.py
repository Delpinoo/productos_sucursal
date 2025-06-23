# -*- coding: utf-8 -*-
import grpc
from concurrent import futures
import time
import os
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
from decimal import Decimal # Importar Decimal

# Configuración de logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Importa los módulos generados por protobuf
import productos_pb2 as productos_pb2
import productos_pb2_grpc as productos_pb2_grpc
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
    retries = 10 
    retry_delay = 3 
    while retries > 0:
        try:
            logging.info(f"Intentando conectar a la base de datos en {DB_HOST}:{DB_PORT}/{DB_NAME}")
            conn = psycopg2.connect(
                host=DB_HOST,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                port=DB_PORT
            )
            logging.info("Conexión a la base de datos establecida exitosamente.")
            return conn
        except psycopg2.OperationalError as e:
            logging.error(f"Error de conexión a la base de datos: {e}. Reintentando en {retry_delay} segundos...")
            retries -= 1
            time.sleep(retry_delay)
    logging.error("No se pudo establecer conexión con la base de datos después de varios reintentos.")
    return None

def create_database_and_table():
    """Crea la base de datos y la tabla de productos si no existen."""
    temp_conn = None
    try:
        # Conectar a la base de datos 'postgres' para crear la DB si no existe
        temp_conn = psycopg2.connect(
            host=DB_HOST,
            database='postgres', 
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        temp_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = temp_conn.cursor()

        # Verificar si la base de datos existe, si no, crearla
        cursor.execute(sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"), [DB_NAME])
        if not cursor.fetchone():
            logging.info(f"Base de datos '{DB_NAME}' no existe. Creándola...")
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
            logging.info(f"Base de datos '{DB_NAME}' creada.")
        else:
            logging.info(f"Base de datos '{DB_NAME}' ya existe.")
        cursor.close()
    except Exception as e:
        logging.error(f"Error al verificar/crear la base de datos: {e}")
        if temp_conn:
            temp_conn.close()
        return

    finally:
        if temp_conn:
            temp_conn.close()

    # Ahora conectar a la base de datos específica para crear las tablas
    conn = None
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            # --- CAMBIO: Ajustar la creación de la tabla productos para coincidir con init.sql y .proto ---
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS productos (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(255) NOT NULL UNIQUE,
                    descripcion TEXT,
                    imagen BYTEA
                );
            """)
            # Se asume que sucursales, stock, ventas, detalles_venta son creadas por init.sql
            # Si este servidor fuera el único punto de inicialización, deberían crearse aquí también.

            conn.commit()
            logging.info("Tabla 'productos' verificada/creada.")

            # Sembrar datos iniciales si la tabla está vacía (opcional, init.sql ya hace esto)
            cursor.execute("SELECT COUNT(*) FROM productos")
            if cursor.fetchone()[0] == 0:
                logging.info("Tabla 'productos' está vacía. Insertando datos de ejemplo...")
                cursor.execute("""
                    INSERT INTO productos (nombre, descripcion, imagen) VALUES
                    ('Laptop Gamer', 'Potente laptop para juegos de última generación.', NULL),
                    ('Monitor 27"', 'Monitor de alta resolución para productividad y juegos.', NULL),
                    ('Teclado Mecánico', 'Teclado con switches mecánicos y retroiluminación RGB.', NULL),
                    ('Mouse Inalámbrico', 'Mouse ergonómico con batería de larga duración.', NULL);
                """)
                conn.commit()
                logging.info("Datos de ejemplo insertados en 'productos'.")
            else:
                logging.info("Tabla 'productos' ya contiene datos.")

    except Exception as e:
        logging.error(f"Error al crear tablas o insertar datos: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cursor.close()
            conn.close()


class ProductosService(productos_pb2_grpc.ProductosServiceServicer):
    def GetProducto(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_details('No se pudo conectar a la base de datos')
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            return productos_pb2.ProductoResponse(success=False, message="Database unavailable")

        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id, nombre, descripcion, imagen FROM productos WHERE id = %s", (request.id,))
            row = cursor.fetchone()
            if row:
                producto = productos_pb2.Producto(
                    id=row[0],
                    nombre=row[1],
                    descripcion=row[2],
                    imagen=row[3] if row[3] else b'' 
                )
                return productos_pb2.ProductoResponse(
                    producto=producto,
                    message="Producto encontrado",
                    success=True
                )
            else:
                context.set_details('Producto no encontrado')
                context.set_code(grpc.StatusCode.NOT_FOUND)
                return productos_pb2.ProductoResponse(success=False, message="Producto no encontrado")
        except Exception as e:
            logging.error(f"Error al obtener producto: {e}")
            context.set_details(f'Error interno del servidor: {e}')
            context.set_code(grpc.StatusCode.INTERNAL)
            return productos_pb2.ProductoResponse(success=False, message="Internal server error")
        finally:
            cursor.close()
            conn.close()

    def SearchProductos(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_details('No se pudo conectar a la base de datos')
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            return productos_pb2.ListProductosResponse() 

        cursor = conn.cursor()
        productos = []
        try:
            query_sql = """
                SELECT id, nombre, descripcion, imagen
                FROM productos
                WHERE nombre ILIKE %s OR descripcion ILIKE %s;
            """
            search_term = f"%{request.query}%"
            cursor.execute(query_sql, (search_term, search_term))
            rows = cursor.fetchall()

            for row in rows:
                productos.append(
                    productos_pb2.Producto(
                        id=row[0],
                        nombre=row[1],
                        descripcion=row[2],
                        imagen=row[3] if row[3] else b''
                    )
                )
            return productos_pb2.ListProductosResponse(productos=productos)
        except Exception as e:
            logging.error(f"Error al buscar productos: {e}")
            context.set_details(f'Error interno del servidor: {e}')
            context.set_code(grpc.StatusCode.INTERNAL)
            return productos_pb2.ListProductosResponse()
        finally:
            cursor.close()
            conn.close()

    def CreateProducto(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_details('No se pudo conectar a la base de datos')
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            return productos_pb2.ProductoResponse(success=False, message="Database unavailable")

        cursor = conn.cursor()
        try:
            # 1. Insertar el nuevo producto
            cursor.execute(
                "INSERT INTO productos (nombre, descripcion, imagen) VALUES (%s, %s, %s) RETURNING id",
                (request.nombre, request.descripcion, request.imagen)
            )
            producto_id = cursor.fetchone()[0]
            logging.info(f"Producto {request.nombre} creado con ID: {producto_id}")

            # 2. Insertar el stock inicial para la sucursal especificada
            # --- CAMBIO: Validar que la sucursal inicial exista ---
            cursor.execute("SELECT id FROM sucursales WHERE id = %s", (request.id_sucursal_inicial,))
            if not cursor.fetchone():
                conn.rollback()
                context.set_details('La sucursal inicial especificada no existe.')
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                return productos_pb2.ProductoResponse(success=False, message="La sucursal inicial no existe.")

            # --- CAMBIO: Validar cantidades y precios iniciales (mayor que cero) ---
            if request.cantidad_inicial < 0:
                conn.rollback()
                context.set_details('La cantidad inicial no puede ser negativa.')
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                return productos_pb2.ProductoResponse(success=False, message="La cantidad inicial no puede ser negativa.")
            
            if request.precio_inicial <= 0: 
                conn.rollback()
                context.set_details('El precio inicial debe ser mayor que cero.')
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                return productos_pb2.ProductoResponse(success=False, message="El precio inicial debe ser mayor que cero.")

            # --- CAMBIO: Insertar/Actualizar en la tabla stock ---
            cursor.execute(
                """
                INSERT INTO stock (id_sucursal, id_producto, cantidad, precio)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id_sucursal, id_producto) DO UPDATE
                SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio;
                """,
                (request.id_sucursal_inicial, producto_id, request.cantidad_inicial, Decimal(str(request.precio_inicial)))
            )
            conn.commit()
            logging.info(f"Stock inicial de {request.cantidad_inicial} para producto {producto_id} en sucursal {request.id_sucursal_inicial} con precio {request.precio_inicial} asignado.")


            new_producto = productos_pb2.Producto(
                id=producto_id,
                nombre=request.nombre,
                descripcion=request.descripcion,
                imagen=request.imagen
            )
            return productos_pb2.ProductoResponse(
                producto=new_producto,
                message="Producto creado y stock inicial asignado exitosamente",
                success=True
            )
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            context.set_details('El nombre del producto ya existe.')
            context.set_code(grpc.StatusCode.ALREADY_EXISTS)
            return productos_pb2.ProductoResponse(success=False, message="El nombre del producto ya existe")
        except Exception as e:
            logging.error(f"Error al crear producto y/o asignar stock inicial: {e}")
            conn.rollback()
            context.set_details(f'Error interno del servidor: {e}')
            context.set_code(grpc.StatusCode.INTERNAL)
            return productos_pb2.ProductoResponse(success=False, message="Internal server error")
        finally:
            cursor.close()
            conn.close()

    def UpdateProducto(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_details('No se pudo conectar a la base de datos')
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            return productos_pb2.ProductoResponse(success=False, message="Database unavailable")

        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id FROM productos WHERE id = %s", (request.id,))
            if not cursor.fetchone():
                context.set_details('Producto no encontrado')
                context.set_code(grpc.StatusCode.NOT_FOUND)
                return productos_pb2.ProductoResponse(success=False, message="Producto no encontrado")

            cursor.execute(
                """
                UPDATE productos
                SET nombre = %s, descripcion = %s, imagen = %s
                WHERE id = %s
                """,
                (request.nombre, request.descripcion, request.imagen, request.id)
            )
            conn.commit()

            updated_producto = productos_pb2.Producto(
                id=request.id,
                nombre=request.nombre,
                descripcion=request.descripcion,
                imagen=request.imagen
            )
            return productos_pb2.ProductoResponse(
                producto=updated_producto,
                message="Producto actualizado exitosamente",
                success=True
            )
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            context.set_details('El nombre del producto ya existe.')
            context.set_code(grpc.StatusCode.ALREADY_EXISTS)
            return productos_pb2.ProductoResponse(success=False, message="El nombre del producto ya existe")
        except Exception as e:
            logging.error(f"Error al actualizar producto: {e}")
            conn.rollback()
            context.set_details(f'Error interno del servidor: {e}')
            context.set_code(grpc.StatusCode.INTERNAL)
            return productos_pb2.ProductoResponse(success=False, message="Internal server error")
        finally:
            cursor.close()
            conn.close()

    def DeleteProducto(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_details('No se pudo conectar a la base de datos')
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            return empty_pb2.Empty()

        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM productos WHERE id = %s RETURNING id", (request.id,))
            deleted_id = cursor.fetchone()
            conn.commit()
            if deleted_id:
                logging.info(f"Producto con ID {request.id} eliminado.")
                return empty_pb2.Empty()
            else:
                logging.warning(f"Intento de eliminar producto no existente con ID {request.id}")
                context.set_details('Producto no encontrado')
                context.set_code(grpc.StatusCode.NOT_FOUND)
                return empty_pb2.Empty()
        except Exception as e:
            logging.error(f"Error al eliminar producto: {e}")
            conn.rollback()
            context.set_details(f'Error interno del servidor: {e}')
            context.set_code(grpc.StatusCode.INTERNAL)
            return empty_pb2.Empty()
        finally:
            cursor.close()
            conn.close()

    def ListProductos(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_details('No se pudo conectar a la base de datos')
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            return productos_pb2.ListProductosResponse()

        cursor = conn.cursor()
        productos = []
        try:
            cursor.execute("SELECT id, nombre, descripcion, imagen FROM productos")
            rows = cursor.fetchall()
            for row in rows:
                productos.append(
                    productos_pb2.Producto(
                        id=row[0],
                        nombre=row[1],
                        descripcion=row[2],
                        imagen=row[3] if row[3] else b'' 
                    )
                )
            return productos_pb2.ListProductosResponse(productos=productos)
        except Exception as e:
            logging.error(f"Error al listar productos: {e}")
            context.set_details(f'Error interno del servidor: {e}')
            context.set_code(grpc.StatusCode.INTERNAL)
            return productos_pb2.ListProductosResponse()
        finally:
            cursor.close()
            conn.close()

    # Los RPCs de Sucursales y Stock NO están implementados en este servidor gRPC.
    # La API REST se encarga de ellos por ahora, o se implementarían aquí si se requiriera en el futuro.
    def CreateSucursal(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.SucursalResponse(success=False, message="Método no implementado")

    def GetSucursal(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.SucursalResponse(success=False, message="Método no implementado")

    def ListSucursales(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.ListSucursalesResponse()

    def AddStock(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.StockResponse(success=False, message="Método no implementado")

    def RemoveStock(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.StockResponse(success=False, message="Método no implementado")

    def UpdateStock(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.StockResponse(success=False, message="Método no implementado")

    def GetStock(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.StockResponse(success=False, message="Método no implementado")

    def ListStockByProduct(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.ListStockByProductResponse()

    def ListStockByBranch(self, request, context):
        context.set_details('Método no implementado en este servicio gRPC.')
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        return productos_pb2.ListStockByBranchResponse()


def serve():
    """Función principal que inicia el servidor gRPC."""
    logging.info("Creando base de datos y tablas si es necesario...")
    create_database_and_table() 

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    productos_pb2_grpc.add_ProductosServiceServicer_to_server(ProductosService(), server)
    server.add_insecure_port('[::]:50051')
    logging.info("Servidor gRPC iniciado y escuchando en el puerto 50051...")
    server.start()
    try:
        while True:
            time.sleep(86400)  # Mantener vivo el servidor
    except KeyboardInterrupt:
        logging.info("Servidor gRPC detenido por el usuario.")
        server.stop(0)


if __name__ == '__main__':
    serve()