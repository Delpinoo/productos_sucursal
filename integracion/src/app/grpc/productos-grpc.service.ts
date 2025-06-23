import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
// Importa los archivos gRPC generados.
// Asegúrate de que la ruta sea correcta según dónde los tienes en tu proyecto.
// Es CRÍTICO: Este archivo 'productos-grpc.service.ts' DEBE estar en el mismo directorio
// que los archivos generados 'productos_pb.ts' y 'ProductosServiceClientPb.ts'.

import {
  Producto, ProductoResponse, ListProductosResponse,
  CreateProductoRequest, GetProductoRequest, UpdateProductoRequest, DeleteProductoRequest, SearchProductosRequest,
  Sucursal, SucursalResponse, ListSucursalesResponse,
  StockProducto, StockResponse, ListStockByProductRequest, ListStockByProductResponse, ListStockByBranchRequest, ListStockByBranchResponse,
  AddStockRequest, RemoveStockRequest, UpdateStockRequest, GetStockRequest
} from './productos_pb'; // Asegúrate de que todos estos se exporten en productos_pb.ts
import { ProductosServiceClient } from './ProductosServiceClientPb'; // Nota: el nombre de la clase es ProductosServiceClient
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';


// Define una interfaz para los objetos AsObject generados por Protobuf.js.
// Usa los tipos AsObject generados directamente.
export type ProductoAsObject = Producto.AsObject;
export type StockProductoAsObject = StockProducto.AsObject;
export type SucursalAsObject = Sucursal.AsObject; // Añadido para consistencia si se usa

@Injectable({
  providedIn: 'root'
})
export class ProductosGrpcService {
  private client: ProductosServiceClient;

  constructor() {
    // Asegúrate de que la URL del proxy de Envoy sea la correcta.
    // Si Angular se ejecuta en http://localhost:4200 y Envoy en http://localhost:8080
    this.client = new ProductosServiceClient('http://localhost:8080');
  }

  /**
   * Crea un nuevo producto.
   * @param productoData Datos del producto a crear (objeto plano).
   * @returns Observable del producto creado como un objeto plano.
   */
  createProducto(productoData: { nombre: string; descripcion: string; imagen?: string }): Observable<ProductoAsObject> {
    console.log('DEBUG: Llamando a createProducto con:', productoData);
    const request = new CreateProductoRequest();
    const newProducto = new Producto();
    newProducto.setNombre(productoData.nombre);
    newProducto.setDescripcion(productoData.descripcion);
    if (productoData.imagen) {
      // Asume que la imagen es una cadena base64 y la convierte a Uint8Array
      newProducto.setImagen(productoData.imagen);
    }
// @ts-ignore
request.setProduct(newProducto);

    return from(
      new Promise<ProductoResponse>((resolve, reject) => {
        this.client.createProducto(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al crear producto:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de CreateProducto:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de CreateProducto vacía o inválida.'));
          }
        });
      })
    ).pipe(
      map(response => response.toObject().producto as ProductoAsObject) // CORREGIDO: Acceder a .producto
    );
  }

  /**
   * Obtiene un producto por su ID.
   * @param id ID del producto.
   * @returns Observable del producto como un objeto plano.
   */
  getProducto(id: number): Observable<ProductoAsObject> {
    console.log(`DEBUG: Llamando a getProducto para ID: ${id}`);
    const request = new GetProductoRequest();
    request.setId(id);

    return from(
      new Promise<ProductoResponse>((resolve, reject) => {
        this.client.getProducto(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al obtener producto:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de GetProducto:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de GetProducto vacía o inválida.'));
          }
        });
      })
    ).pipe(
      map(response => response.toObject().producto as ProductoAsObject) // CORREGIDO: Acceder a .producto
    );
  }

  /**
   * Lista todos los productos.
   * @returns Observable de un array de productos como objetos planos.
   */
  listProductos(): Observable<ProductoAsObject[]> {
    console.log('DEBUG: Llamando a listProductos');
    return from(
      new Promise<ListProductosResponse>((resolve, reject) => {
        this.client.listProductos(new Empty(), {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al listar productos:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de ListProductos:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de ListProductos vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getProductosList() y mapear a ProductoAsObject
      map(response => response.getProductosList().map((p: Producto) => p.toObject() as ProductoAsObject))
    );
  }

  /**
   * Actualiza un producto existente.
   * @param productoData Datos actualizados del producto (objeto plano, debe incluir ID).
   * @returns Observable del producto actualizado como un objeto plano.
   */
  updateProducto(productoData: { id: number; nombre: string; descripcion: string; imagen?: string }): Observable<ProductoAsObject> {
    console.log('DEBUG: Llamando a updateProducto con:', productoData);
    const request = new UpdateProductoRequest();
    const updatedProducto = new Producto();
    updatedProducto.setId(productoData.id);
    updatedProducto.setNombre(productoData.nombre);
    updatedProducto.setDescripcion(productoData.descripcion);
    if (productoData.imagen) {
      updatedProducto.setImagen(productoData.imagen);
    }
// @ts-ignore
request.setProduct(updatedProducto);

    return from(
      new Promise<ProductoResponse>((resolve, reject) => {
        this.client.updateProducto(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al actualizar producto:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de UpdateProducto:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de UpdateProducto vacía o inválida.'));
          }
        });
      })
    ).pipe(
      map(response => response.toObject().producto as ProductoAsObject) // CORREGIDO: Acceder a .producto
    );
  }

  /**
   * Elimina un producto por su ID.
   * @param id ID del producto a eliminar.
   * @returns Observable vacío (Empty) si la eliminación fue exitosa.
   */
  deleteProducto(id: number): Observable<Empty> {
    console.log(`DEBUG: Llamando a deleteProducto para ID: ${id}`);
    const request = new DeleteProductoRequest();
    request.setId(id);

    return from(
      new Promise<Empty>((resolve, reject) => {
        this.client.deleteProducto(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al eliminar producto:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de DeleteProducto (Empty):', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de DeleteProducto vacía o inválida.'));
          }
        });
      })
    );
  }

  /**
   * Busca productos por un término de consulta.
   * @param query Término de búsqueda.
   * @returns Observable de un array de productos que coinciden con la búsqueda como objetos planos.
   */
  searchProductos(query: string): Observable<ProductoAsObject[]> {
    console.log(`DEBUG: Llamando a searchProductos para query: ${query}`);
    const request = new SearchProductosRequest();
    request.setQuery(query);

    return from(
      new Promise<ListProductosResponse>((resolve, reject) => {
        this.client.searchProductos(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al buscar productos:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de SearchProductos:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de SearchProductos vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getProductosList() y mapear a ProductoAsObject
      map(response => response.getProductosList().map((p: Producto) => p.toObject() as ProductoAsObject))
    );
  }

  /**
   * Añade stock a un producto en una sucursal específica.
   * @param data Datos del stock a añadir.
   * @returns Observable de la respuesta de stock.
   */
  addStock(data: { idSucursal: number, idProducto: number, cantidad: number, precio: number }): Observable<StockResponse.AsObject> {
    console.log('DEBUG: Llamando a addStock con:', data);
    const request = new AddStockRequest();
    const stockProducto = new StockProducto();
    stockProducto.setIdSucursal(data.idSucursal);
    stockProducto.setIdProducto(data.idProducto);
    stockProducto.setCantidad(data.cantidad);
    stockProducto.setPrecio(data.precio);
    request.setIdProducto(stockProducto.getIdProducto());
request.setIdSucursal(stockProducto.getIdSucursal());
request.setCantidadASumar(stockProducto.getCantidad());

    return from(
      new Promise<StockResponse>((resolve, reject) => {
        this.client.addStock(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al añadir stock:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de AddStock:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de AddStock vacía o inválida.'));
          }
        });
      })
    ).pipe(
      map(response => response.toObject() as StockResponse.AsObject)
    );
  }

  /**
   * Remueve stock de un producto en una sucursal específica.
   * @param idSucursal ID de la sucursal.
   * @param idProducto ID del producto.
   * @param cantidad Cantidad a remover.
   * @returns Observable de la respuesta de stock.
   */
  removeStock(idSucursal: number, idProducto: number, cantidad: number): Observable<StockResponse.AsObject> {
    console.log(`DEBUG: Llamando a removeStock para sucursal ${idSucursal}, producto ${idProducto}, cantidad ${cantidad}`);
    const request = new RemoveStockRequest();
    request.setIdSucursal(idSucursal);
    request.setIdProducto(idProducto);
    request.setCantidadARestar(cantidad);

    return from(
      new Promise<StockResponse>((resolve, reject) => {
        this.client.removeStock(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al remover stock:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de RemoveStock:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de RemoveStock vacía o inválida.'));
          }
        });
      })
    ).pipe(
      map(response => response.toObject() as StockResponse.AsObject)
    );
  }

  /**
   * Actualiza el stock de un producto en una sucursal.
   * @param data Datos del stock a actualizar (debe incluir ID del stock).
   * @returns Observable de la respuesta de stock.
   */
  updateStock(data: { id: number, idSucursal: number, idProducto: number, cantidad: number, precio: number }): Observable<StockResponse.AsObject> {
    console.log('DEBUG: Llamando a updateStock con:', data);
    const request = new UpdateStockRequest();
    const stockProducto = new StockProducto();
    stockProducto.setId(data.id);
    stockProducto.setIdSucursal(data.idSucursal);
    stockProducto.setIdProducto(data.idProducto);
    stockProducto.setCantidad(data.cantidad);
    stockProducto.setPrecio(data.precio);
    request.setIdProducto(stockProducto.getIdProducto());
request.setIdSucursal(stockProducto.getIdSucursal());
request.setNuevaCantidad(stockProducto.getCantidad());
request.setNuevoPrecio(stockProducto.getPrecio());

    return from(
      new Promise<StockResponse>((resolve, reject) => {
        this.client.updateStock(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al actualizar stock:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de UpdateStock:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de UpdateStock vacía o inválida.'));
          }
        });
      })
    ).pipe(
      map(response => response.toObject() as StockResponse.AsObject)
    );
  }

  // CÁMBIALO A ESTO:
  /**
   * Obtiene el stock de un producto específico en una sucursal específica.
   * @param idProducto ID del producto.
   * @param idSucursal ID de la sucursal donde se busca el stock.
   * @returns Observable de StockProducto.
   */
  getStock(idProducto: number, idSucursal: number): Observable<StockProducto> { // <-- ¡Añade idSucursal aquí!
    console.log(`DEBUG: Llamando a getStock para producto ${idProducto} en sucursal ${idSucursal}`);
    const request = new GetStockRequest();
    request.setIdProducto(idProducto);
    request.setIdSucursal(idSucursal); // <-- Ya no debería dar error de 'Cannot find name'

    return from(
      new Promise<StockResponse>((resolve, reject) => {
        this.client.getStock(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al obtener stock:', err.code, err.message);
            return reject(err);
          }
          if (response && response.getSuccess()) {
            console.log('DEBUG: Respuesta de getStock:', response.toObject());
            return resolve(response);
          } else {
            console.error('ERROR: Error o respuesta de getStock inválida:', response ? response.getMessage() : 'Respuesta vacía');
            return reject(new Error(response ? response.getMessage() : 'Respuesta de GetStock vacía o inválida.'));
          }
        });
      })
    ).pipe(
      map(response => {
        // Asegúrate de que getStockProducto no sea undefined antes de llamar a toObject()
        const stockProducto = response.getStockProducto();
        if (!stockProducto) {
          throw new Error('StockProducto no encontrado en la respuesta.');
        }
        return stockProducto;
      })
    );
  }

  /**
   * Lista el stock de un producto específico en todas las sucursales.
   * @param idProducto ID del producto.
   * @returns Observable de un array de StockProducto.
   */
  listStockByProduct(idProducto: number): Observable<StockProductoAsObject[]> {
    console.log(`DEBUG: Llamando a listStockByProduct para producto ${idProducto}`);
    const request = new ListStockByProductRequest();
    request.setIdProducto(idProducto);

    return from(
      new Promise<ListStockByProductResponse>((resolve, reject) => {
        this.client.listStockByProduct(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al listar stock por producto:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de ListStockByProduct:', response.toObject());
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de ListStockByProduct vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getStockProductosList() y mapear a StockProductoAsObject
      map(response => response.getStockProductosList().map((sp: StockProducto) => sp.toObject() as StockProductoAsObject))
    );
  }

  /**
   * Lista el stock de todos los productos en una sucursal específica.
   * @param idSucursal ID de la sucursal.
   * @returns Observable de un array de StockProducto.
   */
  listStockByBranch(idSucursal: number): Observable<StockProductoAsObject[]> {
    console.log(`DEBUG: Llamando a listStockByBranch para sucursal ${idSucursal}`);
    const request = new ListStockByBranchRequest();
    request.setIdSucursal(idSucursal);

    return from(
      new Promise<ListStockByBranchResponse>((resolve, reject) => {
        this.client.listStockByBranch(request, {}, (err, response) => {
          if (err) {
            console.error('ERROR: Error al listar stock por sucursal:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de listStockByBranch:', response.toObject());
            // CORREGIDO: Usar getStockProductosList() y mapear correctamente
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de ListStockByBranch vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getStockProductosList() y mapear a StockProductoAsObject
      map(response => response.getStockProductosList().map((sp: StockProducto) => sp.toObject() as StockProductoAsObject))
    );
  }
}