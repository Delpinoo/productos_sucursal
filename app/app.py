from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import psycopg2
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='templates')
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    conn = None
    try:
        if DATABASE_URL:
            result = urlparse(DATABASE_URL)
            username = result.username
            password = result.password
            database = result.path[1:]
            hostname = result.hostname
            port = result.port
            conn = psycopg2.connect(host=hostname, database=database, user=username, password=password, port=port)
        else:
            print("La variable de entorno DATABASE_URL no está configurada.")
    except psycopg2.Error as e:
        print(f"Error al conectar a la base de datos: {e}")
    return conn

'''
@app.route('/')  # Esta es la ruta para la página de inicio
def index():
    return "¡Bienvenido a mi aplicación Flask!"
'''

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
                for key in request.form:
                    if key.startswith('productos'):
                        try:
                            index = int(key.split('[')[1].split(']')[0])
                            field = key.split('[')[2].split(']')[0]
                            if len(productos_vendidos) <= index:
                                productos_vendidos.append({})
                            productos_vendidos[index][field] = request.form[key]
                        except ValueError:
                            continue  # Ignorar campos de formulario no estructurados como se espera

                if not id_sucursal or not productos_vendidos:
                    return jsonify({'error': 'Solicitud inválida: id_sucursal y productos son requeridos'}), 400

                try:
                    id_sucursal = int(id_sucursal)
                    for item in productos_vendidos:
                        item['id_producto'] = int(item.get('id_producto'))
                        item['cantidad'] = int(item.get('cantidad'))
                        if not isinstance(item['id_producto'], int) or not isinstance(item['cantidad'], int) or item['cantidad'] <= 0:
                            raise ValueError("Datos de producto inválidos en la solicitud")
                except ValueError as e:
                    return jsonify({'error': f'Error en el formato de los datos: {e}'}), 400

                total_venta = 0.0
                venta_id = None

                # Insertar la nueva venta
                cur.execute("INSERT INTO ventas (id_sucursal) VALUES (%s) RETURNING id", (id_sucursal,))
                venta_id = cur.fetchone()[0]

                for item in productos_vendidos:
                    id_producto = item['id_producto']
                    cantidad = item['cantidad']

                    # Verificar stock
                    cur.execute("SELECT cantidad, precio FROM stock WHERE id_sucursal = %s AND id_producto = %s", (id_sucursal, id_producto))
                    stock_info = cur.fetchone()

                    if not stock_info or stock_info[0] < cantidad:
                        raise ValueError(f"Stock insuficiente para el producto con ID {id_producto} en la sucursal {id_sucursal}")

                    stock_actual, precio_unitario = stock_info

                    # Insertar en detalles_venta
                    cur.execute("INSERT INTO detalles_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (%s, %s, %s, %s)",
                                (venta_id, id_producto, cantidad, precio_unitario))

                    # Actualizar stock
                    cur.execute("UPDATE stock SET cantidad = cantidad - %s WHERE id_sucursal = %s AND id_producto = %s",
                                (cantidad, id_sucursal, id_producto))

                    total_venta += precio_unitario * cantidad

                # Actualizar el total de la venta
                cur.execute("UPDATE ventas SET total_venta = %s WHERE id = %s", (total_venta, venta_id))

                conn.commit()
                cur.close()
                conn.close()
                return jsonify({'message': 'Venta registrada exitosamente', 'id_venta': venta_id}), 201

            return render_template('formulario_venta.html')

        except psycopg2.Error as e:
            if conn:
                conn.rollback()
                cur.close()
                conn.close()
            return jsonify({'error': f'Error al registrar la venta en la base de datos: {e}'}), 500
        except ValueError as ve:
            if conn:
                conn.rollback()
                cur.close()
                conn.close()
            return jsonify({'error': str(ve)}), 400
        except Exception as ex:
            if conn:
                conn.rollback()
                cur.close()
                conn.close()
            return jsonify({'error': f'Error inesperado al registrar la venta: {ex}'}), 500
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
    app.run(debug=True)