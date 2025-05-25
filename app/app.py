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
    for client_queue in clients:
        try:
            client_queue.put(message)
            app.logger.debug(f"SSE: Mensaje puesto en cola para cliente {id(client_queue)}")
        except Exception as e:
            app.logger.error(f"SSE: Error al enviar datos a la cola de un cliente {id(client_queue)}: {e}")

@app.route('/events')
@stream_with_context
def sse_events():
    """
    Endpoint para Server-Sent Events (SSE).
    Cada cliente que se conecta a esta ruta recibirá un stream de eventos.
    """
    current_client_queue = Queue()
    clients.append(current_client_queue)
    app.logger.info(f"SSE: Nuevo cliente conectado. ID de la cola: {id(current_client_queue)}. Clientes actuales: {len(clients)}")

    def generate_events():
        while True:
            try:
                message = current_client_queue.get()
                yield message
            except GeneratorExit:
                clients.remove(current_client_queue)
                app.logger.info(f"SSE: Cliente desconectado (GeneratorExit). Clientes restantes: {len(clients)}")
                break
            except Exception as e:
                app.logger.error(f"SSE: Error inesperado en el generador de eventos para cliente {id(current_client_queue)}: {e}")
                clients.remove(current_client_queue)
                break

    return Response(generate_events(), mimetype='text/event-stream')

# --- FIN: Lógica para Server-Sent Events (SSE) ---


def get_db_connection():
    conn = None
    try:
        hostname = os.environ.get('DB_HOST')
        database = os.environ.get('DB_NAME')
        username = os.environ.get('DB_USER')
        password = os.environ.get('DB_PASSWORD')
        port = os.environ.get('DB_PORT', '5432')

        app.logger.debug(f"DB_CONNECT: DB_HOST={hostname}")
        app.logger.debug(f"DB_CONNECT: DB_NAME={database}")
        app.logger.debug(f"DB_CONNECT: DB_USER={username}")
        # app.logger.debug(f"DB_CONNECT: DB_PASSWORD={password}") # ¡Cuidado al imprimir contraseñas en logs de producción!
        app.logger.debug(f"DB_CONNECT: DB_PORT={port}")
        
        if not all([hostname, database, username, password]):
            app.logger.error("DB_CONNECT: Faltan variables de entorno de la base de datos.")
            return None

        conn = psycopg2.connect(
            host=hostname,
            database=database,
            user=username,
            password=password,
            port=port
        )
    except psycopg2.Error as e:
        app.logger.error(f"DB_CONNECT: Error al conectar a la base de datos: {e}")
    return conn

@app.route('/')
def get_sucursales():
    conn = get_db_connection()
    sucursales = []
    if conn:
        cur = conn.cursor()
        cur.execute("SELECT id, nombre FROM sucursales")
        sucursales = cur.fetchall()
        cur.close()
        conn.close()
    return render_template('sucursales.html', sucursales=sucursales)


@app.route('/productos/stock', methods=['GET'])
def get_productos_con_stock():
    termino = request.args.get('termino')
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        if termino:
            cur.execute("""
                SELECT p.id, p.nombre, p.descripcion, s.id_sucursal, su.nombre as nombre_sucursal, s.cantidad, s.precio
                FROM productos p
                LEFT JOIN stock s ON p.id = s.id_producto
                LEFT JOIN sucursales su ON s.id_sucursal = su.id
                WHERE LOWER(p.nombre) LIKE %s
            """, ('%' + termino.lower() + '%',))
            resultados = cur.fetchall()
        else:
            cur.execute("""
                SELECT p.id, p.nombre, p.descripcion, s.id_sucursal, su.nombre as nombre_sucursal, s.cantidad, s.precio
                FROM productos p
                LEFT JOIN stock s ON p.id = s.id_producto
                LEFT JOIN sucursales su ON s.id_sucursal = su.id
            """)
            resultados = cur.fetchall()
        cur.close()
        conn.close()

        productos_con_stock = {}
        for resultado in resultados:
            id_producto, nombre_producto, descripcion_producto, id_sucursal, nombre_sucursal, cantidad, precio = resultado
            if id_producto not in productos_con_stock:
                productos_con_stock[id_producto] = {
                    'id': id_producto,
                    'nombre': nombre_producto,
                    'descripcion': descripcion_producto,
                    'stockPorSucursal': []
                }
            if id_sucursal:
                productos_con_stock[id_producto]['stockPorSucursal'].append({
                    'idSucursal': id_sucursal,
                    'nombreSucursal': nombre_sucursal,
                    'cantidad': cantidad,
                    'precio': precio
                })

        return jsonify(list(productos_con_stock.values()))
    return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

@app.route('/venta', methods=['GET', 'POST'])
def registrar_venta():
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            if request.method == 'POST':
                id_sucursal = request.form.get('id_sucursal')
                productos_vendidos = []
                app.logger.debug(f"REGISTRAR_VENTA: Contenido de request.form: {request.form}")

                for key in request.form:
                    if key.startswith('productos'):
                        try:
                            index = int(key.split('[')[1].split(']')[0])
                            field = key.split('[')[2].split(']')[0]
                            if len(productos_vendidos) <= index:
                                productos_vendidos.append({})
                            productos_vendidos[index][field] = request.form[key]
                        except ValueError:
                            continue
                
                app.logger.debug(f"REGISTRAR_VENTA: Productos vendidos parseados: {productos_vendidos}")

                if not id_sucursal or not productos_vendidos:
                    app.logger.warning(f"REGISTRAR_VENTA: Solicitud inválida. id_sucursal: {id_sucursal}, productos_vendidos: {productos_vendidos}")
                    return jsonify({'error': 'Solicitud inválida: id_sucursal y productos son requeridos'}), 400

                try:
                    id_sucursal = int(id_sucursal)
                    for item in productos_vendidos:
                        item['id_producto'] = int(item.get('id_producto'))
                        item['cantidad'] = int(item.get('cantidad'))
                        if not isinstance(item['id_producto'], int) or not isinstance(item['cantidad'], int) or item['cantidad'] <= 0:
                            raise ValueError("Datos de producto inválidos en la solicitud")
                except ValueError as e:
                    app.logger.error(f"REGISTRAR_VENTA: Error en el formato de los datos: {e}")
                    return jsonify({'error': f'Error en el formato de los datos: {e}'}), 400

                # --- CAMBIO CLAVE AQUÍ: Inicializar total_venta como Decimal ---
                total_venta = Decimal('0.0') 
                venta_id = None

                app.logger.debug(f"REGISTRAR_VENTA: Tipo de total_venta inicial: {type(total_venta)}") # Nuevo log de depuración

                cur.execute("INSERT INTO ventas (id_sucursal, total_venta) VALUES (%s, %s) RETURNING id", (id_sucursal, total_venta))
                venta_id = cur.fetchone()[0]
                app.logger.debug(f"REGISTRAR_VENTA: Venta ID creada: {venta_id} con total_venta inicial: {total_venta}")

                for item in productos_vendidos:
                    id_producto = item['id_producto']
                    cantidad_vendida = item['cantidad']

                    # --- Obtener stock actual, precio, nombre de producto y sucursal ---
                    cur.execute("SELECT st.cantidad, st.precio, p.nombre as nombre_producto, su.nombre as nombre_sucursal "
                                "FROM stock st "
                                "JOIN productos p ON st.id_producto = p.id "
                                "JOIN sucursales su ON st.id_sucursal = su.id "
                                "WHERE st.id_sucursal = %s AND st.id_producto = %s",
                                (id_sucursal, id_producto))
                    stock_info = cur.fetchone()

                    if not stock_info:
                        app.logger.error(f"REGISTRAR_VENTA: Producto con ID {id_producto} no encontrado en la sucursal {id_sucursal}.")
                        raise ValueError(f"Producto con ID {id_producto} no encontrado en la sucursal {id_sucursal}.")

                    stock_actual, precio_unitario, nombre_producto, nombre_sucursal = stock_info

                    app.logger.debug(f"\n--- DEBUG Venta de Producto ---")
                    app.logger.debug(f"Producto ID: {id_producto}, Nombre: {nombre_producto}")
                    app.logger.debug(f"Sucursal ID: {id_sucursal}, Nombre: {nombre_sucursal}")
                    app.logger.debug(f"Cantidad a vender: {cantidad_vendida}")
                    app.logger.debug(f"Stock actual (antes de la venta): {stock_actual}")
                    app.logger.debug(f"DEBUG_TYPE: Tipo de stock_actual: {type(stock_actual)}") # Nuevo log de depuración
                    app.logger.debug(f"DEBUG_TYPE: Tipo de precio_unitario: {type(precio_unitario)}") # Nuevo log de depuración


                    if stock_actual < cantidad_vendida:
                        app.logger.warning(f"REGISTRAR_VENTA: Stock insuficiente para '{nombre_producto}' en '{nombre_sucursal}'. Disp: {stock_actual}, Sol: {cantidad_vendida}")
                        raise ValueError(f"Stock insuficiente para el producto '{nombre_producto}' en la sucursal '{nombre_sucursal}'. Disponible: {stock_actual}, Solicitado: {cantidad_vendida}")

                    # Actualizar stock en la base de datos
                    cur.execute("UPDATE stock SET cantidad = cantidad - %s WHERE id_sucursal = %s AND id_producto = %s",
                                (cantidad_vendida, id_sucursal, id_producto))

                    # Calcular nuevo stock después de la venta
                    nuevo_stock = stock_actual - cantidad_vendida

                    app.logger.debug(f"Nuevo stock calculado (después de la venta): {nuevo_stock}")

                    # --- Lógica de Notificación SSE ---
                    if int(nuevo_stock) == 0: # Convertir a int para asegurar la comparación exacta
                        app.logger.info(f"SSE_NOTIFY: ¡Condición de stock agotado (nuevo_stock == 0) es VERDADERA para '{nombre_producto}' en '{nombre_sucursal}'!")
                        notification_data = {
                            "type": "stock_agotado",
                            "product_id": id_producto,
                            "product_name": nombre_producto,
                            "sucursal_id": id_sucursal,
                            "sucursal_name": nombre_sucursal,
                            "message": f"¡Alerta! El stock de '{nombre_producto}' en '{nombre_sucursal}' se ha agotado."
                        }
                        notify_clients(notification_data)
                        app.logger.info(f"SSE_NOTIFY: Notificación SSE enviada: {notification_data['message']}")
                    else:
                        app.logger.debug(f"SSE_NOTIFY: El nuevo stock ({nuevo_stock}) NO es cero. No se envía notificación SSE.")
                    # --- Fin Lógica de Notificación SSE ---

                    cur.execute("INSERT INTO detalles_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (%s, %s, %s, %s)",
                                (venta_id, id_producto, cantidad_vendida, precio_unitario))

                    # --- DEBUGGING TYPES BEFORE ADDITION ---
                    app.logger.debug(f"DEBUG_TYPE: Tipo de total_venta antes de la suma: {type(total_venta)}")
                    app.logger.debug(f"DEBUG_TYPE: Tipo de precio_unitario (en la suma): {type(precio_unitario)}")
                    app.logger.debug(f"DEBUG_TYPE: Tipo de cantidad_vendida (en la suma): {type(cantidad_vendida)}")
                    app.logger.debug(f"DEBUG_TYPE: Valor de precio_unitario: {precio_unitario}")
                    app.logger.debug(f"DEBUG_TYPE: Valor de cantidad_vendida: {cantidad_vendida}")
                    app.logger.debug(f"DEBUG_TYPE: Valor de total_venta antes de la suma: {total_venta}")

                    # --- CAMBIO CLAVE AQUÍ: Asegurarse de que precio_unitario sea Decimal antes de sumar ---
                    # Si precio_unitario ya es Decimal (que es lo que psycopg2 suele devolver para NUMERIC),
                    # no es necesario Decimal(str(precio_unitario)). Solo precio_unitario * cantidad_vendida es suficiente.
                    # Sin embargo, para máxima seguridad, podemos mantener Decimal(str(precio_unitario))
                    # si hay dudas sobre el tipo exacto que llega de la DB en todos los casos.
                    # La forma más limpia si precio_unitario es siempre Decimal es:
                    total_venta += precio_unitario * Decimal(cantidad_vendida) # Convertir cantidad_vendida a Decimal para la operación si es int/float
                    # O si precio_unitario puede ser float por alguna razón:
                    # total_venta += Decimal(str(precio_unitario)) * Decimal(cantidad_vendida)


                cur.execute("UPDATE ventas SET total_venta = %s WHERE id = %s", (total_venta, venta_id))

                conn.commit()
                cur.close()
                conn.close()
                app.logger.info(f"REGISTRAR_VENTA: Venta {venta_id} registrada exitosamente.")
                return jsonify({'message': 'Venta registrada exitosamente', 'id_venta': venta_id}), 201

            return render_template('formulario_venta.html')

        except psycopg2.Error as e:
            if conn:
                conn.rollback()
                cur.close()
                conn.close()
            app.logger.error(f"REGISTRAR_VENTA: Error de base de datos al registrar venta: {e}")
            return jsonify({'error': f'Error al registrar la venta en la base de datos: {e}'}), 500
        except ValueError as ve:
            if conn:
                conn.rollback()
                cur.close()
                conn.close()
            app.logger.error(f"REGISTRAR_VENTA: Error de valor al registrar venta: {ve}")
            return jsonify({'error': str(ve)}), 400
        except Exception as ex:
            if conn:
                conn.rollback()
                cur.close()
                conn.close()
            app.logger.error(f"REGISTRAR_VENTA: Error inesperado al registrar venta: {ex}")
            return jsonify({'error': f'Error inesperado al registrar la venta: {ex}'}), 500
    app.logger.error("REGISTRAR_VENTA: No se pudo conectar a la base de datos al iniciar registrar_venta.")
    return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500


@app.route('/sucursales')
def listar_sucursales():
    conn = get_db_connection()
    sucursales = []
    if conn:
        cur = conn.cursor()
        cur.execute("SELECT id, nombre FROM sucursales")
        sucursales = cur.fetchall()
        cur.close()
        conn.close()
    return render_template('sucursales.html', sucursales=sucursales)

if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=5000)
