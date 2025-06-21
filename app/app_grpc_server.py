# app/app_grpc_server.py
import grpc
import os
import time
from concurrent.futures import ThreadPoolExecutor
import psycopg2
from dotenv import load_dotenv, find_dotenv
import traceback # ¡NUEVA LÍNEA: Importar el módulo traceback!

# Importar los archivos generados por protoc
from productos_pb2 import Producto, ProductoResponse, ListProductosResponse
from productos_pb2_grpc import ProductosServiceServicer, add_ProductosServiceServicer_to_server

# Importar Empty desde su ubicación correcta en los tipos conocidos de Protobuf
from google.protobuf.empty_pb2 import Empty


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


# Función de conexión a la base de datos (reutiliza de seed_db.py)
def get_db_connection():
    try:
        hostname = os.environ.get('DB_HOST')
        database = os.environ.get('DB_NAME')
        username = os.environ.get('DB_USER')
        password = os.environ.get('DB_PASSWORD')
        port = os.environ.get('DB_PORT', '5432')

        print(f"DEBUG: Conectando a DB con: host={hostname}, db={database}, user={username}, port={port}")
        conn = psycopg2.connect(
            host=hostname,
            database=database,
            user=username,
            password=password,
            port=port
        )
        print("Conexión a la DB exitosa desde el servidor gRPC.")
        return conn
    except psycopg2.Error as e:
        print(f"ERROR: No se pudo conectar a la base de datos desde el servidor gRPC: {e}")
        print(traceback.format_exc())
        return None

# Implementación del servicio gRPC
class ProductosService(ProductosServiceServicer):
    def GetProducto(self, request, context):
        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("No se pudo conectar a la base de datos.")
            return ProductoResponse()

        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nombre, precio, imagen FROM productos WHERE id = %s", (request.id,))
            row = cur.fetchone()
            cur.close()
            conn.close()

            if row:
                imagen_data = bytes(row[3]) if isinstance(row[3], memoryview) else (row[3] if row[3] else b'')
                return ProductoResponse(
                    producto=Producto(
                        id=row[0],
                        nombre=row[1],
                        precio=row[2],
                        imagen=imagen_data
                    ),
                    message="Producto encontrado.",
                    success=True
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
            context.set_details("No se pudo conectar a la base de datos.")
            return ProductoResponse()

        try:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO productos (nombre, precio, imagen) VALUES (%s, %s, %s) RETURNING id;",
                (request.producto.nombre, request.producto.precio, request.producto.imagen)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()

            created_producto = Producto(
                id=new_id,
                nombre=request.producto.nombre,
                precio=request.producto.precio,
                imagen=request.producto.imagen
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
            context.set_details("No se pudo conectar a la base de datos.")
            return ListProductosResponse()

        productos_list = []
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nombre, precio, imagen FROM productos ORDER BY id")
            rows = cur.fetchall()
            cur.close()
            conn.close()

            for row in rows:
                imagen_data = bytes(row[3]) if isinstance(row[3], memoryview) else (row[3] if row[3] else b'')
                productos_list.append(Producto(
                    id=row[0],
                    nombre=row[1],
                    precio=row[2],
                    imagen=imagen_data
                ))
            return ListProductosResponse(productos=productos_list)
        except Exception as e:
            print(f"ERROR al listar productos: {e}")
            print(traceback.format_exc())
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error interno del servidor: {e}")
            return ListProductosResponse()

def serve():
    server = grpc.server(ThreadPoolExecutor(max_workers=10))
    add_ProductosServiceServicer_to_server(ProductosService(), server)
    server.add_insecure_port('[::]:50051')
    print("Servidor gRPC iniciado en el puerto 50051.")
    server.start()
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
