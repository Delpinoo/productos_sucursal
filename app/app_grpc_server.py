# app/app_grpc_server.py
import grpc
import os
import time
from concurrent.futures import ThreadPoolExecutor
import psycopg2
from dotenv import load_dotenv, find_dotenv
import traceback
from datetime import datetime # Para manejar timestamps

# Importar los archivos generados por protoc (Ajustado para nuevas estructuras)
from productos_pb2 import (
    Producto, ProductoResponse, ListProductosResponse,
    Sucursal, SucursalResponse, ListSucursalesResponse,
    StockProducto, StockResponse, ListStockByProductResponse, ListStockByBranchResponse,
    CreateProductoRequest, GetProductoRequest,
    CreateSucursalRequest, GetSucursalRequest,
    AddStockRequest, RemoveStockRequest, UpdateStockRequest, GetStockRequest,
    ListStockByProductRequest, ListStockByBranchRequest
)
from productos_pb2_grpc import ProductosServiceServicer, add_ProductosServiceServicer_to_server
from google.protobuf.empty_pb2 import Empty
from google.protobuf.timestamp_pb2 import Timestamp # Para manejar timestamps


# Cargar variables de entorno
dotenv_path = find_dotenv()
if dotenv_path:
    load_dotenv(dotenv_path)
    print(f"INFO: Archivo .env encontrado y cargado desde: {dotenv_path}")
else:
    print("WARNING: Archivo .env NO ENCONTRADO por find_dotenv(). Verifique la ubicación.")


# --- INICIO DE DEPURACIÓN DE VARIABLES DE ENTORNO ---
print("--- DEBUG: Valores de variables de entorno DISPONIBLES EN os.environ ---")
print(f"DB_HOST: {os.environ.get('DB_HOST')}")
print(f"DB_NAME: {os.environ.get('DB_NAME')}")
print(f"DB_USER: {os.environ.get('DB_USER')}")
password_debug = os.environ.get('DB_PASSWORD')
if password_debug:
    print(f"DB_PASSWORD: {'*' * len(password_debug)} (length: {len(password_debug)})")
else:
    print(f"DB_PASSWORD: None/Empty")
print(f"DB_PORT: {os.environ.get('DB_PORT')}")
print("--- FIN DE DEPURACIÓN ---")


# Función de conexión a la base de datos (¡CON LÓGICA DE REINTENTOS!)
def get_db_connection(max_attempts=10, delay=5):
    attempt = 0
    while attempt < max_attempts:
        try:
            hostname = os.environ.get('DB_HOST')
            database = os.environ.get('DB_NAME')
            username = os.environ.get('DB_USER')
            password = os.environ.get('DB_PASSWORD')
            port = os.environ.get('DB_PORT', '5432')

            print(f"DEBUG: Intento {attempt + 1}/{max_attempts} - Conectando a DB: host={hostname}, db={database}, user={username}, port={port}")
            conn = psycopg2.connect(
                host=hostname,
                database=database,
                user=username,
                password=password,
                port=port
            )
            print("INFO: Conexión a la base de datos exitosa.")
            return conn
        except psycopg2.OperationalError as e:
            print(f"ADVERTENCIA: Error de conexión a la base de datos (intento {attempt + 1}/{max_attempts}): {e}")
            if attempt < max_attempts - 1:
                print(f"INFO: Reintentando en {delay} segundos...")
                time.sleep(delay)
            attempt += 1
        except Exception as e:
            print(f"ERROR: Un error inesperado ocurrió al intentar conectar a la base de datos: {e}")
            print(traceback.format_exc())
            return None
    print("ERROR: Fallaron todos los intentos de conexión a la base de datos.")
    return None

# Implementación del servicio gRPC
class ProductosService(ProductosServiceServicer):
    # RPCs de Productos (AJUSTADAS)
    def GetProducto(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return ProductoResponse()
        try:
            cur = conn.cursor()
            # Selecciona nombre, descripcion, imagen de la tabla productos
            cur.execute("SELECT id, nombre, descripcion, imagen FROM productos WHERE id = %s", (request.id,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                imagen_data = bytes(row[3]) if isinstance(row[3], memoryview) else (row[3] if row[3] else b'')
                return ProductoResponse(
                    producto=Producto(
                        id=row[0], nombre=row[1], descripcion=row[2], imagen=imagen_data
                    ), message="Producto encontrado.", success=True
                )
            else:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Producto no encontrado.")
                return ProductoResponse(message="Producto no encontrado.", success=False)
        except Exception as e:
            print(f"ERROR al obtener producto: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return ProductoResponse(message=f"Error interno: {e}", success=False)

    def CreateProducto(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return ProductoResponse()
        try:
            cur = conn.cursor()
            # Inserta nombre, descripcion, imagen
            cur.execute(
                "INSERT INTO productos (nombre, descripcion, imagen) VALUES (%s, %s, %s) RETURNING id;",
                (request.nombre, request.descripcion, request.imagen)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            created_producto = Producto(
                id=new_id, nombre=request.nombre, descripcion=request.descripcion, imagen=request.imagen
            )
            return ProductoResponse(producto=created_producto, message="Producto creado exitosamente.", success=True)
        except Exception as e:
            conn.rollback()
            print(f"ERROR al crear producto: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return ProductoResponse(message=f"Error interno: {e}", success=False)

    def ListProductos(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return ListProductosResponse()
        productos_list = []
        try:
            cur = conn.cursor()
            # Selecciona nombre, descripcion, imagen
            cur.execute("SELECT id, nombre, descripcion, imagen FROM productos ORDER BY id")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            for row in rows:
                imagen_data = bytes(row[3]) if isinstance(row[3], memoryview) else (row[3] if row[3] else b'')
                productos_list.append(Producto(
                    id=row[0], nombre=row[1], descripcion=row[2], imagen=imagen_data
                ))
            return ListProductosResponse(productos=productos_list)
        except Exception as e:
            print(f"ERROR al listar productos: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return ListProductosResponse()

    # RPCs de Sucursales (AJUSTADAS)
    def CreateSucursal(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return SucursalResponse()
        try:
            cur = conn.cursor()
            # Solo inserta nombre
            cur.execute(
                "INSERT INTO sucursales (nombre) VALUES (%s) RETURNING id;",
                (request.nombre,)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            created_sucursal = Sucursal(id=new_id, nombre=request.nombre) # Sin direccion
            return SucursalResponse(sucursal=created_sucursal, message="Sucursal creada exitosamente.", success=True)
        except Exception as e:
            conn.rollback()
            print(f"ERROR al crear sucursal: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return SucursalResponse(message=f"Error interno: {e}", success=False)

    def GetSucursal(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return SucursalResponse()
        try:
            cur = conn.cursor()
            # Solo selecciona nombre
            cur.execute("SELECT id, nombre FROM sucursales WHERE id = %s", (request.id,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                return SucursalResponse(
                    sucursal=Sucursal(id=row[0], nombre=row[1]), # Sin direccion
                    message="Sucursal encontrada.", success=True
                )
            else:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Sucursal no encontrada.")
                return SucursalResponse(message="Sucursal no encontrada.", success=False)
        except Exception as e:
            print(f"ERROR al obtener sucursal: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return SucursalResponse(message=f"Error interno: {e}", success=False)

    def ListSucursales(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return ListSucursalesResponse()
        sucursales_list = []
        try:
            cur = conn.cursor()
            # Solo selecciona nombre
            cur.execute("SELECT id, nombre FROM sucursales ORDER BY id")
            rows = cur.fetchall()
            cur.close()
            conn.close()
            for row in rows:
                sucursales_list.append(Sucursal(id=row[0], nombre=row[1])) # Sin direccion
            return ListSucursalesResponse(sucursales=sucursales_list)
        except Exception as e:
            print(f"ERROR al listar sucursales: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return ListSucursalesResponse()

    # RPCs de Stock (AJUSTADAS para la nueva estructura 'StockProducto')
    def AddStock(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return StockResponse()
        try:
            cur = conn.cursor()
            # Intenta insertar o actualizar el stock
            cur.execute(
                """
                INSERT INTO stock (id_producto, id_sucursal, cantidad, precio)
                VALUES (%s, %s, %s, (SELECT precio FROM stock WHERE id_producto = %s AND id_sucursal = %s LIMIT 1)) -- Intenta mantener el precio existente o null
                ON CONFLICT (id_producto, id_sucursal) DO UPDATE SET cantidad = stock.cantidad + EXCLUDED.cantidad
                RETURNING id, id_producto, id_sucursal, cantidad, precio;
                """,
                (request.id_producto, request.id_sucursal, request.cantidad_a_sumar, request.id_producto, request.id_sucursal)
            )
            stock_info = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            return StockResponse(
                stock_producto=StockProducto(
                    id=stock_info[0], id_producto=stock_info[1], id_sucursal=stock_info[2],
                    cantidad=stock_info[3], precio=float(stock_info[4]) if stock_info[4] else 0.0
                ),
                message="Stock añadido exitosamente.", success=True
            )
        except Exception as e:
            conn.rollback()
            print(f"ERROR al añadir stock: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return StockResponse(message=f"Error interno: {e}", success=False)

    def RemoveStock(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return StockResponse()
        try:
            cur = conn.cursor()
            cur.execute(
                """
                UPDATE stock SET cantidad = GREATEST(0, cantidad - %s)
                WHERE id_producto = %s AND id_sucursal = %s
                RETURNING id, id_producto, id_sucursal, cantidad, precio;
                """,
                (request.cantidad_a_restar, request.id_producto, request.id_sucursal)
            )
            stock_info = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            if stock_info:
                return StockResponse(
                    stock_producto=StockProducto(
                        id=stock_info[0], id_producto=stock_info[1], id_sucursal=stock_info[2],
                        cantidad=stock_info[3], precio=float(stock_info[4]) if stock_info[4] else 0.0
                    ),
                    message="Stock removido exitosamente.", success=True
                )
            else:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Producto o sucursal no encontrado para remover stock.")
                return StockResponse(message="Producto o sucursal no encontrado para remover stock.", success=False)
        except Exception as e:
            conn.rollback()
            print(f"ERROR al remover stock: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return StockResponse(message=f"Error interno: {e}", success=False)

    def UpdateStock(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return StockResponse()
        try:
            cur = conn.cursor()
            # Actualiza cantidad y precio
            cur.execute(
                """
                INSERT INTO stock (id_producto, id_sucursal, cantidad, precio)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id_producto, id_sucursal) DO UPDATE SET cantidad = EXCLUDED.cantidad, precio = EXCLUDED.precio
                RETURNING id, id_producto, id_sucursal, cantidad, precio;
                """,
                (request.id_producto, request.id_sucursal, request.nueva_cantidad, request.nuevo_precio)
            )
            stock_info = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            return StockResponse(
                stock_producto=StockProducto(
                    id=stock_info[0], id_producto=stock_info[1], id_sucursal=stock_info[2],
                    cantidad=stock_info[3], precio=float(stock_info[4]) if stock_info[4] else 0.0
                ),
                message="Stock actualizado exitosamente.", success=True
            )
        except Exception as e:
            conn.rollback()
            print(f"ERROR al actualizar stock: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return StockResponse(message=f"Error interno: {e}", success=False)

    def GetStock(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return StockResponse()
        try:
            cur = conn.cursor()
            # Selecciona todos los campos de stock
            cur.execute(
                "SELECT id, id_producto, id_sucursal, cantidad, precio FROM stock WHERE id_producto = %s AND id_sucursal = %s",
                (request.id_producto, request.id_sucursal)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                return StockResponse(
                    stock_producto=StockProducto(
                        id=row[0], id_producto=row[1], id_sucursal=row[2],
                        cantidad=row[3], precio=float(row[4]) if row[4] else 0.0
                    ),
                    message="Stock encontrado.", success=True
                )
            else:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Stock no encontrado para el producto en la sucursal especificada.")
                return StockResponse(message="Stock no encontrado.", success=False)
        except Exception as e:
            print(f"ERROR al obtener stock: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return StockResponse(message=f"Error interno: {e}", success=False)

    def ListStockByProduct(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return ListStockByProductResponse()
        stock_list = []
        try:
            cur = conn.cursor()
            # Selecciona todos los campos de stock
            cur.execute(
                "SELECT id, id_producto, id_sucursal, cantidad, precio FROM stock WHERE id_producto = %s ORDER BY id_sucursal",
                (request.id_producto,)
            )
            rows = cur.fetchall()
            cur.close()
            conn.close()
            for row in rows:
                stock_list.append(StockProducto(
                    id=row[0], id_producto=row[1], id_sucursal=row[2],
                    cantidad=row[3], precio=float(row[4]) if row[4] else 0.0
                ))
            return ListStockByProductResponse(stock_productos=stock_list)
        except Exception as e:
            print(f"ERROR al listar stock por producto: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return ListStockByProductResponse()

    def ListStockByBranch(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("Error interno del servidor: No se pudo conectar a la base de datos.")
            return ListStockByBranchResponse()
        stock_list = []
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, id_producto, id_sucursal, cantidad, precio FROM stock WHERE id_sucursal = %s ORDER BY id_producto",
                (request.id_sucursal,)
            )
            rows = cur.fetchall()
            cur.close()
            conn.close()
            for row in rows:
                stock_list.append(StockProducto(
                    id=row[0], id_producto=row[1], id_sucursal=row[2],
                    cantidad=row[3], precio=float(row[4]) if row[4] else 0.0
                ))
            return ListStockByBranchResponse(stock_productos=stock_list)
        except Exception as e:
            print(f"ERROR al listar stock por sucursal: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return ListStockByBranchResponse()


def serve():
    server = grpc.server(ThreadPoolExecutor(max_workers=10))
    add_ProductosServiceServicer_to_server(ProductosService(), server)
    server.add_insecure_port('[::]:50051')
    print("INFO: Servidor gRPC iniciado en el puerto 50051.")
    server.start()
    try:
        while True:
            time.sleep(86400) # Un día
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    # Antes de iniciar el servidor gRPC, intentamos sembrar la base de datos
    print("INFO: Intentando sembrar la base de datos...")
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            # Ejecuta el script SQL completo de init.sql para crear tablas e insertar datos
            # Lee el contenido del archivo init.sql
            with open('./init.sql', 'r') as f:
                sql_script = f.read()
            cur.execute(sql_script)
            conn.commit()
            print("INFO: Base de datos sembrada/verificada exitosamente con init.sql.")
            cur.close()
            conn.close()
        except Exception as e:
            print(f"ERROR: Fallo al sembrar la base de datos desde init.sql: {e}")
            print(traceback.format_exc())
            if conn:
                conn.rollback()
            if conn:
                conn.close()
    else:
        print("ERROR: No se pudo establecer conexión con la base de datos para el sembrado inicial.")

    serve() # Solo inicia el servidor si se intentó sembrar la base de datos
