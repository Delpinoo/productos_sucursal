# C:\\Users\\benja\\OneDrive\\Escritorio\\porno\\productos_sucursal\\app\\test_client.py

import grpc
from google.protobuf.empty_pb2 import Empty
import productos_pb2
import productos_pb2_grpc
import sys
from datetime import datetime
from google.protobuf.timestamp_pb2 import Timestamp # Para crear timestamps


def run(host='localhost', port=50051): # ¡Puerto cambiado a 50051 para conectar directamente al gRPC server si no hay Envoy!'
    channel = grpc.insecure_channel(f'{host}:{port}')
    stub = productos_pb2_grpc.ProductosServiceStub(channel)

    print(f"--- Probando Listar Productos en {host}:{port} ---")
    try:
        response = stub.ListProductos(Empty())
        if response.productos:
            print("Productos encontrados:")
            for producto in response.productos:
                print(f"   ID: {producto.id}, Nombre: {producto.nombre}, Descripción: {producto.descripcion}")
        else:
            print("No se encontraron productos.")
    except grpc.RpcError as e:
        print(f"Error RPC al listar productos: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al listar productos: {e}")

    print("\n--- Probando Crear Producto ---")
    new_product_id = None
    try:
        new_product = productos_pb2.CreateProductoRequest(
            nombre="Producto Creado por Cliente",
            descripcion="Descripción del producto de prueba",
            imagen=b"bytes_de_imagen_nueva_prod"
        )
        response = stub.CreateProducto(new_product)
        if response.success:
            print(f"Producto creado exitosamente: ID {response.producto.id}, Mensaje: {response.message}")
            new_product_id = response.producto.id
        else:
            print(f"Fallo al crear producto: {response.message}")
    except grpc.RpcError as e:
        print(f"Error RPC al crear producto: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al crear producto: {e}")

    if new_product_id:
        print(f"\n--- Probando Obtener Producto (ID: {new_product_id}) ---")
        try:
            response = stub.GetProducto(productos_pb2.GetProductoRequest(id=new_product_id))
            if response.success:
                print(f"Producto obtenido: ID: {response.producto.id}, Nombre: {response.producto.nombre}, Descripción: {response.producto.descripcion}")
            else:
                print(f"Fallo al obtener producto: {response.message}")
        except grpc.RpcError as e:
            print(f"Error RPC al obtener producto: {e.code().name} - {e.details()}")
        except Exception as e:
            print(f"Error inesperado al obtener producto: {e}")

    print("\n--- Probando Sucursales ---")
    new_sucursal_id = None
    try:
        print("\n--- Probando Crear Sucursal (con dirección) ---")
        # ¡IMPORTANTE: Ahora enviamos la dirección!
        create_suc_req = productos_pb2.CreateSucursalRequest(
            nombre="Sucursal del Cliente Test",
            direccion="Calle Falsa 123, Ciudad de Prueba" # ¡Incluida la dirección!
        )
        suc_response = stub.CreateSucursal(create_suc_req)
        if suc_response.success:
            print(f"Sucursal creada: ID {suc_response.sucursal.id}, Nombre: {suc_response.sucursal.nombre}, Dirección: {suc_response.sucursal.direccion}")
            new_sucursal_id = suc_response.sucursal.id
        else:
            print(f"Fallo al crear sucursal: {suc_response.message}")
    except grpc.RpcError as e:
        print(f"Error RPC al crear sucursal: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al crear sucursal: {e}")

    if new_sucursal_id:
        print(f"\n--- Probando Obtener Sucursal (ID: {new_sucursal_id}) ---")
        try:
            get_suc_req = productos_pb2.GetSucursalRequest(id=new_sucursal_id)
            suc_response = stub.GetSucursal(get_suc_req)
            if suc_response.success:
                print(f"Sucursal obtenida: ID: {suc_response.sucursal.id}, Nombre: {suc_response.sucursal.nombre}, Dirección: {suc_response.sucursal.direccion}")
            else:
                print(f"Fallo al obtener sucursal: {suc_response.message}")
        except grpc.RpcError as e:
            print(f"Error RPC al obtener sucursal: {e.code().name} - {e.details()}")
        except Exception as e:
            print(f"Error inesperado al obtener sucursal: {e}")

    try:
        print("\n--- Probando Listar Sucursales (con dirección) ---")
        list_suc_response = stub.ListSucursales(Empty())
        if list_suc_response.sucursales:
            print("Sucursales encontradas:")
            for sucursal in list_suc_response.sucursales:
                print(f"   ID: {sucursal.id}, Nombre: {sucursal.nombre}, Dirección: {sucursal.direccion}")
        else:
            print("No se encontraron sucursales.")
    except grpc.RpcError as e:
        print(f"Error RPC al listar sucurales: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al listar sucursales: {e}")


    print("\n--- Probando Stock de Productos ---")
    test_product_id = 1
    test_branch_id = 1
    test_new_product_id = new_product_id if new_product_id else 1
    test_new_branch_id = new_sucursal_id if new_sucursal_id else 1

    print(f"\n--- Probando Añadir Stock (Producto {test_new_product_id}, Sucursal {test_new_branch_id}) ---")
    try:
        add_stock_req = productos_pb2.AddStockRequest(id_producto=test_new_product_id, id_sucursal=test_new_branch_id, cantidad_a_sumar=15)
        stock_response = stub.AddStock(add_stock_req)
        if stock_response.success:
            print(f"Stock añadido: ID {stock_response.stock_producto.id}, Producto ID: {stock_response.stock_producto.id_producto}, Sucursal ID: {stock_response.stock_producto.id_sucursal}, Cantidad: {stock_response.stock_producto.cantidad}, Precio: {stock_response.stock_producto.precio}")
        else:
            print(f"Fallo al añadir stock: {stock_response.message}")
    except grpc.RpcError as e:
        print(f"Error RPC al añadir stock: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al añadir stock: {e}")


    print(f"\n--- Probando Obtener Stock (Producto {test_new_product_id}, Sucursal {test_new_branch_id}) ---")
    try:
        get_stock_req = productos_pb2.GetStockRequest(id_producto=test_new_product_id, id_sucursal=test_new_branch_id)
        stock_response = stub.GetStock(get_stock_req)
        if stock_response.success:
            print(f"Stock obtenido: Producto ID {stock_response.stock_producto.id_producto}, Sucursal ID {stock_response.stock_producto.id_sucursal}, Cantidad: {stock_response.stock_producto.cantidad}, Precio: {stock_response.stock_producto.precio}")
        else:
            print(f"Fallo al obtener stock: {stock_response.message}")
    except grpc.RpcError as e:
        print(f"Error RPC al obtener stock: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al obtener stock: {e}")

    print(f"\n--- Probando Actualizar Stock (Producto {test_new_product_id}, Sucursal {test_new_branch_id} a 25 unidades y precio 100.50) ---")
    try:
        update_stock_req = productos_pb2.UpdateStockRequest(id_producto=test_new_product_id, id_sucursal=test_new_branch_id, nueva_cantidad=25, nuevo_precio=100.50)
        stock_response = stub.UpdateStock(update_stock_req)
        if stock_response.success:
            print(f"Stock actualizado: Producto ID {stock_response.stock_producto.id_producto}, Cantidad: {stock_response.stock_producto.cantidad}, Precio: {stock_response.stock_producto.precio}")
        else:
            print(f"Fallo al actualizar stock: {stock_response.message}")
    except grpc.RpcError as e:
        print(f"Error RPC al actualizar stock: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al actualizar stock: {e}")

    print(f"\n--- Probando Remover Stock (Producto {test_new_product_id}, Sucursal {test_new_branch_id} - 5 unidades) ---")
    try:
        remove_stock_req = productos_pb2.RemoveStockRequest(id_producto=test_new_product_id, id_sucursal=test_new_branch_id, cantidad_a_restar=5)
        stock_response = stub.RemoveStock(remove_stock_req)
        if stock_response.success:
            print(f"Stock removido: Producto ID {stock_response.stock_producto.id_producto}, Cantidad restante: {stock_response.stock_producto.cantidad}, Precio: {stock_response.stock_producto.precio}")
        else:
            print(f"Fallo al remover stock: {stock_response.message}")
    except grpc.RpcError as e:
        print(f"Error RPC al remover stock: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al remover stock: {e}")

    print(f"\n--- Probando Listar Stock por Producto (ID: {test_new_product_id}) ---")
    try:
        list_by_product_req = productos_pb2.ListStockByProductRequest(id_producto=test_new_product_id)
        list_stock_response = stub.ListStockByProduct(list_by_product_req)
        if list_stock_response.stock_productos:
            print(f"Stock para Producto ID {test_new_product_id}:")
            for stock_item in list_stock_response.stock_productos:
                print(f"   Sucursal ID: {stock_item.id_sucursal}, Cantidad: {stock_item.cantidad}, Precio: {stock_item.precio}")
        else:
            print(f"No se encontró stock para Producto ID {test_new_product_id}.")
    except grpc.RpcError as e:
        print(f"Error RPC al listar stock por producto: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al listar stock por producto: {e}")

    print(f"\n--- Probando Listar Stock por Sucursal (ID: {test_new_branch_id}) ---")
    try:
        list_by_branch_req = productos_pb2.ListStockByBranchRequest(id_sucursal=test_new_branch_id)
        list_stock_response = stub.ListStockByBranch(list_by_branch_req)
        if list_stock_response.stock_productos:
            print(f"Stock para Sucursal ID {test_new_branch_id}:")
            for stock_item in list_stock_response.stock_productos:
                        print(f"   Producto ID: {stock_item.id_producto}, Cantidad: {stock_item.cantidad}, Precio: {stock_item.precio}")
        else:
            print(f"No se encontró stock para Sucursal ID {test_new_branch_id}.")
    except grpc.RpcError as e:
        print(f"Error RPC al listar stock por sucursal: {e.code().name} - {e.details()}")
    except Exception as e:
        print(f"Error inesperado al listar stock por sucursal: {e}")


if __name__ == "__main__":
    print("Iniciando cliente de prueba gRPC...")
    if len(sys.argv) == 3:
        run(sys.argv[1], int(sys.argv[2]))
    else:
        run() # Conecta a localhost:50051 por defecto
    print("Cliente de prueba gRPC finalizado.")
