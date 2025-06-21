# C:\Users\benja\OneDrive\Escritorio\porno\productos_sucursal\app\test_client.py

import grpc
from google.protobuf.empty_pb2 import Empty

# Estos módulos ahora deberían existir en tu carpeta 'app' de Windows
import productos_pb2
import productos_pb2_grpc
import sys # Importa sys para manejar argumentos

def run(host='localhost', port=8080): # <--- PUERTO 8080
    # Conectarse a la dirección y puerto especificados
    channel = grpc.insecure_channel(f'{host}:{port}')
    stub = productos_pb2_grpc.ProductosServiceStub(channel)

    print(f"--- Probando Listar Productos en {host}:{port} ---")
    try:
        response = stub.ListProductos(Empty())
        if response.productos:
            print("Productos encontrados:")
            for producto in response.productos:
                print(f"  ID: {producto.id}, Nombre: {producto.nombre}, Precio: {producto.precio}")
        else:
            print("No se encontraron productos. Intentando crear uno...")
            # Si no hay productos, intentamos crear uno para que el siguiente test tenga algo que buscar.
            new_product_for_list_test = productos_pb2.Producto(
                nombre="Producto Inicial de Prueba",
                precio=99.99,
                imagen=b"primer_imagen"
            )
            create_response = stub.CreateProducto(productos_pb2.CreateProductoRequest(producto=new_product_for_list_test))
            if create_response.success:
                print(f"  Producto inicial creado: ID {create_response.producto.id}")
                # Re-listar para mostrar el producto creado
                response = stub.ListProductos(Empty())
                if response.productos:
                    print("Productos encontrados después de la creación:")
                    for producto in response.productos:
                        print(f"  ID: {producto.id}, Nombre: {producto.nombre}, Precio: {producto.precio}")
            else:
                print(f"  Fallo al crear producto inicial: {create_response.message}")

    except grpc.RpcError as e:
        print(f"Error RPC al listar productos: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al listar productos: {e}")

    print("\n--- Probando Crear Producto ---")
    try:
        new_product = productos_pb2.Producto(
            nombre="Producto de Prueba del Cliente",
            precio=123.45,
            imagen=b"bytes_de_imagen_del_cliente" # Esto es solo un placeholder
        )
        request = productos_pb2.CreateProductoRequest(producto=new_product)
        response = stub.CreateProducto(request)
        if response.success:
            print(f"Producto creado exitosamente: ID {response.producto.id}, Mensaje: {response.message}")
            product_id_to_get = response.producto.id
        else:
            print(f"Fallo al crear producto: {response.message}")
            product_id_to_get = None
    except grpc.RpcError as e:
        print(f"Error RPC al crear producto: {e.code().name} - {e.details()}")
        product_id_to_get = None
    except Exception as e:
        print(f"Error inesperado al crear producto: {e}")
        product_id_to_get = None


    if product_id_to_get:
        print(f"\n--- Probando Obtener Producto (ID: {product_id_to_get}) ---")
        try:
            response = stub.GetProducto(productos_pb2.GetProductoRequest(id=product_id_to_get))
            if response.success:
                print(f"Producto obtenido: ID: {response.producto.id}, Nombre: {response.producto.nombre}, Precio: {response.producto.precio}")
            else:
                print(f"Fallo al obtener producto: {response.message}")
        except grpc.RpcError as e:
            print(f"Error RPC al obtener producto: {e.code().name} - {e.details()}")
        except Exception as e:
            print(f"Error inesperado al obtener producto: {e}")
    else:
        print("\nSkipping 'Get Producto' test as no product was created successfully.")


if __name__ == '__main__':
    print("Iniciando cliente de prueba gRPC desde Windows...")
    run()
    print("Cliente de prueba gRPC finalizado en Windows.")
