// src/app/interface/producto-con-stock.ts
// Esta interfaz define un producto con sus stocks, usando tipos "AsObject"
// que son representaciones de objetos JavaScript planos de los mensajes Protobuf.
// Esto es útil cuando tu API RESTful (no gRPC) devuelve datos en formato JSON.

import { Producto, StockProducto, Sucursal } from '../grpc/productos_pb';

export interface ProductoConStock extends Producto.AsObject {
  // 'id', 'nombre', 'descripcion', 'imagen' serán propiedades directas, no métodos get/set

  // 'stock_productos' será un array de StockProducto.AsObject
  stock_productos: StockProducto.AsObject[];

  // 'sucursalesData' si lo manejas aquí, también debería ser AsObject[]
  sucursalesData?: Sucursal.AsObject[];
}