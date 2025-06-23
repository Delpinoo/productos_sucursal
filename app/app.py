from flask import Flask, jsonify, request, render_template, Response, stream_with_context
from flask_cors import CORS
import psycopg2
import os
from urllib.parse import urlparse
from dotenv import load_dotenv
import json
from queue import Queue
import logging
from decimal import Decimal # Importar Decimal aquí

load_dotenv()

app = Flask(__name__, template_folder='templates')
CORS(app)

app.logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)


DATABASE_URL = os.environ.get('DATABASE_URL')

# --- INICIO: Lógica para Server-Sent Events (SSE) ---
clients = []

def notify_clients(data):
    """
    Envía un mensaje a todos los clientes SSE conectados.
    Los datos se envían como JSON.
    """
    message = f"data: {json.dumps(data)}\n\n"
    app.logger.debug(f"SSE: Intentando enviar notificación a {len(clients)} clientes: {data}")
    # Usar list() para iterar sobre una copia de clients, y filtrar desconectados
    disconnected_clients = []
    for client_queue in list(clients):
        try:
            client_queue.put(message)
            app.logger.debug(f"SSE: Mensaje puesto en cola para cliente {id(client_queue)}")
        except Exception as e:
            app.logger.error(f"SSE: Error al enviar mensaje a cliente {id(client_queue)}: {e}")
            disconnected_clients.append(client_queue)
    for client_queue in disconnected_clients:
        clients.remove(client_queue)
        app.logger.info(f"SSE: Cliente desconectado y removido. Total clientes: {len(clients)}")

@app.route('/events')
def sse_events():
    """Endpoint para Server-Sent Events."""
    client_queue = Queue()
    clients.append(client_queue)
    app.logger.info(f"SSE: Nuevo cliente conectado. Total clientes: {len(clients)}")

    def generate():
        try:
            while True:
                message = client_queue.get()
                yield message
        except GeneratorExit: # Cliente desconectado
            clients.remove(client_queue)
            app.logger.info(f"SSE: Cliente desconectado. Total clientes: {len(clients)}")
        except Exception as e:
            app.logger.error(f"SSE: Error en generador de eventos: {e}")
            # Si hay un error inesperado, también remover el cliente
            if client_queue in clients: # Evitar errores si ya fue removido
                clients.remove(client_queue)
            app.logger.info(f"SSE: Cliente desconectado por error. Total clientes: {len(clients)}")


    response = Response(stream_with_context(generate()), mimetype='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no' # Para Nginx
    return response

# --- FIN: Lógica para Server-Sent Events (SSE) ---


def get_db_connection():
    """Establece y retorna una conexión a la base de datos PostgreSQL."""
    try:
        # Extraer detalles de la URL de la base de datos
        result = urlparse(DATABASE_URL)
        username = result.username
        password = result.password
        database = result.path[1:]
        hostname = result.hostname
        port = result.port

        conn = psycopg2.connect(
            host=hostname,
            database=database,
            user=username,
            password=password,
            port=port
        )
        app.logger.debug("Conexión a la base de datos establecida.")
        return conn
    except Exception as e:
        app.logger.error(f"Error al conectar a la base de datos: {e}")
        return None

# Ruta para la página principal
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/productos/stock')
def get_productos_con_stock():
    conn = get_db_connection()
    productos_con_stock = []
    if conn:
        cur = None # Inicializar cur a None
        try:
            cur = conn.cursor()
            # Consulta para obtener productos con su stock y precio por sucursal
            cur.execute("""
                SELECT 
                    p.id AS producto_id,
                    p.nombre AS producto_nombre,
                    p.descripcion AS producto_descripcion,
                    p.imagen AS producto_imagen, -- Incluir la imagen aquí
                    s.id AS sucursal_id,
                    s.nombre AS sucursal_nombre,
                    st.cantidad AS stock_cantidad,
                    st.precio AS stock_precio
                FROM productos p
                JOIN stock st ON p.id = st.id_producto
                JOIN sucursales s ON st.id_sucursal = s.id
                ORDER BY p.nombre, s.nombre;
            """)
            rows = cur.fetchall()

            # Estructurar los datos para la respuesta JSON
            productos_dict = {}
            for row in rows:
                prod_id, prod_nombre, prod_desc, prod_imagen, suc_id, suc_nombre, stock_cant, stock_precio = row
                
                if prod_id not in productos_dict:
                    productos_dict[prod_id] = {
                        'id': prod_id,
                        'nombre': prod_nombre,
                        'descripcion': prod_desc,
                        'imagen': prod_imagen.hex() if prod_imagen else None, # Convertir bytes a hex string para JSON
                        'stock_por_sucursal': []
                    }
                productos_dict[prod_id]['stock_por_sucursal'].append({
                    'sucursal_id': suc_id,
                    'sucursal_nombre': suc_nombre,
                    'cantidad': stock_cant,
                    'precio': float(stock_precio)
                })
            
            productos_con_stock = list(productos_dict.values())
            
            return jsonify(productos_con_stock)

        except Exception as e:
            app.logger.error(f"Error al obtener productos con stock: {e}")
            return jsonify({'error': 'Error interno del servidor al obtener productos con stock'}), 500
        finally:
            if cur:
                cur.close()
            conn.close()
    app.logger.error("No se pudo conectar a la base de datos al iniciar get_productos_con_stock.")
    return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500


@app.route('/dolar')
def get_dolar_price():
    # En un entorno real, aquí harías una solicitud a una API externa
    # para obtener el precio actual del dólar.
    # Por simplicidad, retornaremos un valor fijo.
    try:
        precio_dolar = 950.00 # Ejemplo de precio del dólar en CLP
        app.logger.debug(f"Precio del dólar solicitado: {precio_dolar}")
        return jsonify({'precio_dolar': precio_dolar})
    except Exception as e:
        app.logger.error(f"Error al obtener el precio del dólar: {e}")
        return jsonify({'error': 'Error al obtener el precio del dólar'}), 500

@app.route('/venta', methods=['POST'])
def registrar_venta():
    conn = get_db_connection()
    if conn:
        cur = None
        try:
            cur = conn.cursor()
            data = request.json
            app.logger.debug(f"Datos de venta recibidos: {data}")

            # Validaciones básicas de entrada
            if not data or not isinstance(data.get('productos'), list) or not data.get('id_sucursal'):
                raise ValueError("Datos de venta inválidos. Se esperan 'productos' (lista) y 'id_sucursal'.")

            productos_venta = data['productos']
            id_sucursal = data['id_sucursal']
            total_venta = Decimal('0.00') # Usar Decimal para cálculos monetarios

            if not productos_venta:
                raise ValueError("La lista de productos no puede estar vacía.")

            # Iniciar transacción
            cur.execute("BEGIN;")

            # Registrar la venta principal (con un total_venta temporal de 0)
            cur.execute("INSERT INTO ventas (id_sucursal, total_venta) VALUES (%s, %s) RETURNING id",
                        (id_sucursal, total_venta))
            venta_id = cur.fetchone()[0]
            app.logger.info(f"Venta principal registrada con ID: {venta_id}")

            # Procesar cada producto en la venta
            for item in productos_venta:
                producto_id = item.get('id_producto')
                cantidad_vendida = item.get('cantidad')

                if not producto_id or not isinstance(cantidad_vendida, int) or cantidad_vendida <= 0:
                    raise ValueError(f"Detalle de producto inválido: {item}. Se esperan 'id_producto' y 'cantidad' (entero positivo).")

                # Obtener stock y precio actual del producto en la sucursal
                cur.execute("SELECT cantidad, precio FROM stock WHERE id_producto = %s AND id_sucursal = %s FOR UPDATE",
                            (producto_id, id_sucursal)) # Bloquear la fila para evitar condiciones de carrera
                stock_info = cur.fetchone()

                if not stock_info:
                    raise ValueError(f"Producto {producto_id} no encontrado o sin stock registrado en sucursal {id_sucursal}.")
                
                stock_actual, precio_unitario_db = stock_info
                precio_unitario_db = Decimal(str(precio_unitario_db)) # Asegurarse de que sea Decimal

                if stock_actual < cantidad_vendida:
                    raise ValueError(f"Stock insuficiente para el producto {producto_id} en sucursal {id_sucursal}. Disponible: {stock_actual}, Solicitado: {cantidad_vendida}.")

                # Actualizar stock
                nuevo_stock = stock_actual - cantidad_vendida
                cur.execute("UPDATE stock SET cantidad = %s WHERE id_producto = %s AND id_sucursal = %s",
                            (nuevo_stock, producto_id, id_sucursal))
                app.logger.info(f"Stock actualizado para producto {producto_id} en sucursal {id_sucursal}. Nuevo stock: {nuevo_stock}")

                # Registrar detalle de venta
                subtotal_item = precio_unitario_db * Decimal(cantidad_vendida)
                cur.execute("INSERT INTO detalles_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (%s, %s, %s, %s)",
                            (venta_id, producto_id, cantidad_vendida, precio_unitario_db))
                total_venta += subtotal_item
                app.logger.info(f"Detalle de venta registrado para producto {producto_id}. Subtotal: {subtotal_item}")

                # --- CAMBIO IMPORTANTE AQUÍ para SSE ---
                # Notificar a los clientes si el stock es bajo (mejor que 10 unidades) o cero
                if nuevo_stock < 10: # Cambiado de '== 0' a '< 10' para cubrir < 10
                    logging.info(f"SSE: Stock bajo detectado para producto {producto_id} en sucursal {id_sucursal}. Nuevo stock: {nuevo_stock}")
                    notify_clients({
                        'type': 'stock_alert',
                        'product_id': producto_id,
                        'sucursal_id': id_sucursal,
                        'new_stock': nuevo_stock,
                        'message': f'¡Alerta! El stock del producto "{producto_id}" en sucursal "{id_sucursal}" es ahora {nuevo_stock} unidades.'
                    })
                elif nuevo_stock == 0: # Caso específico para stock agotado
                     logging.info(f"SSE: Stock AGOTADO para producto {producto_id} en sucursal {id_sucursal}.")
                     notify_clients({
                        'type': 'stock_agotado',
                        'product_id': producto_id,
                        'sucursal_id': id_sucursal,
                        'new_stock': nuevo_stock,
                        'message': f'¡URGENTE! El stock del producto "{producto_id}" en sucursal "{id_sucursal}" se ha AGOTADO.'
                    })


            # Actualizar el total de la venta principal
            cur.execute("UPDATE ventas SET total_venta = %s WHERE id = %s",
                        (total_venta, venta_id))
            
            conn.commit()
            app.logger.info(f"Venta {venta_id} completada exitosamente. Total: {total_venta}")
            return jsonify({'message': 'Venta registrada exitosamente', 'venta_id': venta_id, 'total_venta': float(total_venta)}), 200

        except psycopg2.Error as e:
            if conn:
                conn.rollback()
                # El cursor se cierra en el finally
            app.logger.error(f"REGISTRAR_VENTA: Error de base de datos al registrar venta: {e}")
            return jsonify({'error': f'Error al registrar la venta en la base de datos: {e}'}), 500
        except ValueError as ve:
            if conn:
                conn.rollback()
                # El cursor se cierra en el finally
            app.logger.error(f"REGISTRAR_VENTA: Error de valor al registrar venta: {ve}")
            return jsonify({'error': str(ve)}), 400
        except Exception as ex:
            if conn:
                conn.rollback()
                # El cursor se cierra en el finally
            app.logger.error(f"REGISTRAR_VENTA: Error inesperado al registrar venta: {ex}")
            return jsonify({'error': f'Error inesperado al registrar la venta: {ex}'}), 500
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()
    app.logger.error("REGISTRAR_VENTA: No se pudo conectar a la base de datos al iniciar registrar_venta.")
    return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500


@app.route('/sucursales')
def listar_sucursales():
    conn = get_db_connection()
    sucursales = []
    if conn:
        cur = None # Inicializar cur a None
        try:
            cur = conn.cursor()
            # Añadir 'direccion' en la selección
            cur.execute("SELECT id, nombre, direccion FROM sucursales") 
            rows = cur.fetchall()
            for row in rows:
                sucursales.append({'id': row[0], 'nombre': row[1], 'direccion': row[2]}) 
            return jsonify(sucursales)
        except Exception as e:
            app.logger.error(f"Error al listar sucursales: {e}")
            return jsonify({'error': 'Error interno del servidor al listar sucursales'}), 500
        finally:
            if cur: # Asegurar que el cursor se cierre solo si existe
                cur.close()
            conn.close()
    app.logger.error("No se pudo conectar a la base de datos al iniciar listar_sucursales.")
    return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

@app.route('/sucursales/<int:sucursal_id>/productos')
def get_productos_by_sucursal(sucursal_id):
    conn = get_db_connection()
    productos_en_sucursal = []
    if conn:
        cur = None # Inicializar cur a None
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    p.id, p.nombre, p.descripcion, p.imagen, s.cantidad, s.precio
                FROM productos p
                JOIN stock s ON p.id = s.id_producto
                WHERE s.id_sucursal = %s
                ORDER BY p.nombre;
            """, (sucursal_id,))
            rows = cur.fetchall()
            for row in rows:
                productos_en_sucursal.append({
                    'id': row[0],
                    'nombre': row[1],
                    'descripcion': row[2],
                    'imagen': row[3].hex() if row[3] else None, # Convertir bytes a hex string
                    'cantidad_en_stock': row[4],
                    'precio_unitario': float(row[5])
                })
            return jsonify(productos_en_sucursal)
        except Exception as e:
            app.logger.error(f"Error al obtener productos por sucursal {sucursal_id}: {e}")
            return jsonify({'error': f'Error interno del servidor al obtener productos para la sucursal {sucursal_id}'}), 500
        finally:
            if cur: # Asegurar que el cursor se cierre solo si existe
                cur.close()
            conn.close()
    app.logger.error("No se pudo conectar a la base de datos al iniciar get_productos_by_sucursal.")
    return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

@app.route('/sucursales/crear', methods=['POST'])
def crear_sucursal():
    conn = get_db_connection()
    if conn:
        cur = None
        try:
            cur = conn.cursor()
            data = request.json
            nombre = data.get('nombre')
            direccion = data.get('direccion')

            if not nombre:
                return jsonify({'error': 'El nombre de la sucursal es requerido'}), 400

            cur.execute("INSERT INTO sucursales (nombre, direccion) VALUES (%s, %s) RETURNING id",
                        (nombre, direccion))
            sucursal_id = cur.fetchone()[0]
            conn.commit()
            return jsonify({'message': 'Sucursal creada exitosamente', 'id': sucursal_id}), 201
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            return jsonify({'error': 'Ya existe una sucursal con ese nombre'}), 409
        except Exception as e:
            app.logger.error(f"Error al crear sucursal: {e}")
            conn.rollback()
            return jsonify({'error': 'Error interno del servidor'}), 500
        finally:
            if cur:
                cur.close()
            conn.close()
    return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)