import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
// No importamos 'grpc' directamente para el tipo RpcError si no lo exporta, usamos 'any' como workaround
// import { grpc } from '@improbable-eng/grpc-web'; 

// Importa los archivos gRPC generados.
// Asegúrate de que la ruta sea correcta según dónde los tienes en tu proyecto.
// ES CRÍTICO: Este archivo 'productos-grpc.service.ts' DEBE estar en el mismo directorio
// que los archivos generados 'productos_pb.ts' y 'ProductosServiceClientPb.ts' (es decir, en 'src/app/grpc/').
// Si NO lo está (como se ve en tu imagen), MUÉVELO PRIMERO y luego RENÓMBRALO a 'productos-grpc.service.ts' si se llama diferente.
// SI SIGUEN APARECIENDO ERRORES DE "Cannot find module" DESPUÉS DE MOVER Y RENOMBRAR, verifica:
// 1. Que los archivos 'productos_pb.ts' y 'ProductosServiceClientPb.ts' existan físicamente en 'src/app/grpc/'.
// 2. Intenta reiniciar tu servidor Angular con 'ng serve --force'.
// 3. Reinicia tu editor (VS Code) para que refresque su caché de TypeScript.
import {
  Producto, ProductoResponse, ListProductosResponse,
  CreateProductoRequest, GetProductoRequest,
  Sucursal, SucursalResponse, ListSucursalesResponse,
  StockProducto, StockResponse, AddStockRequest, RemoveStockRequest, UpdateStockRequest, GetStockRequest,
  ListStockByProductRequest, ListStockByProductResponse, ListStockByBranchRequest, ListStockByBranchResponse,
  CreateSucursalRequest, GetSucursalRequest
} from './productos_pb';
import { ProductosServiceClient } from './ProductosServiceClientPb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';


@Injectable({
  providedIn: 'root'
})
export class ProductosGrpcService {

  private client: ProductosServiceClient;
  private readonly envoyUrl = 'http://localhost:8081'; // Confirmado que es 8081 en el host

  constructor() {
    this.client = new ProductosServiceClient(this.envoyUrl);
    console.log(`INFO: gRPC client inicializado, conectando a: ${this.envoyUrl}`);
  }

  /**
   * Obtiene la lista de todos los productos.
   * @returns Observable de un array de Producto.
   */
  listProductos(): Observable<Producto[]> {
    console.log("DEBUG: Llamando a listProductos...");
    const emptyMsg = new Empty();
    return from(
      new Promise<ListProductosResponse>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.listProductos(emptyMsg, {}, (err: any | null, response?: ListProductosResponse) => {
          if (err) {
            console.error('ERROR: Error al listar productos:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de listProductos:', response.toObject());
            // CORREGIDO: Usar getProductosList() según la sugerencia de TypeScript
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de ListProductos vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getProductosList() según la sugerencia de TypeScript
      map(response => response.getProductosList()) // <--- CAMBIO AQUÍ: getProductosList()
    );
  }

  /**
   * Crea un nuevo producto.
   * @param nombre El nombre del producto.
   * @param descripcion La descripción del producto.
   * @param imagen Los bytes de la imagen del producto (Uint8Array).
   * @returns Observable del Producto creado.
   */
  createProducto(nombre: string, descripcion: string, imagen: Uint8Array): Observable<Producto> {
    console.log(`DEBUG: Llamando a createProducto con nombre: ${nombre}`);
    const newProduct = new Producto();
    newProduct.setNombre(nombre);
    newProduct.setDescripcion(descripcion);
    newProduct.setImagen(imagen);

    const request = new CreateProductoRequest();
    // **IMPORTANTE:** Si este error persiste, y recibes "Property 'producto' does not exist",
    // esto sugiere que el archivo 'productos_pb.ts' *no* está generando la propiedad 'producto'
    // directamente ni el método 'setProducto'. Esto es un problema con la generación de Protobuf.
    // Sin embargo, si el error vuelve a ser "Property 'setProducto' does not exist", significa
    // que la asignación directa no es el camino.
    // En este punto, estamos intentando el método estándar 'setProducto()'.
    request.setProducto(newProduct); // <--- Volviendo al uso de setProducto()


    return from(
      new Promise<Producto>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.createProducto(request, {}, (err: any | null, response?: ProductoResponse) => {
          if (err) {
            console.error('ERROR: Error al crear producto:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Asegurar que response.getProducto() no es undefined
          if (response && response.getSuccess()) {
            const product = response.getProducto(); // Asignar a una variable local para narrowing
            if (product !== undefined) {
              console.log('DEBUG: Producto creado:', product.toObject());
              return resolve(product); // Devolver la variable local tipada correctamente
            }
          }
          const errorMessage = response ? response.getMessage() : 'Error desconocido al crear producto.';
          console.error('ERROR: Fallo al crear producto:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  /**
   * Obtiene un producto por su ID.
   * @param id El ID del producto a obtener.
   * @returns Observable del Producto obtenido.
   */
  getProducto(id: number): Observable<Producto> {
    console.log(`DEBUG: Llamando a getProducto con ID: ${id}`);
    const request = new GetProductoRequest();
    request.setId(id);

    return from(
      new Promise<Producto>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.getProducto(request, {}, (err: any | null, response?: ProductoResponse) => {
          if (err) {
            console.error('ERROR: Error al obtener producto:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Asegurar que response.getProducto() no es undefined
          if (response && response.getSuccess()) {
            const product = response.getProducto(); // Asignar a una variable local para narrowing
            if (product !== undefined) {
              console.log('DEBUG: Producto obtenido:', product.toObject());
              return resolve(product); // Devolver la variable local tipada correctamente
            }
          }
          const errorMessage = response ? response.getMessage() : 'Error desconocido al obtener producto.';
          console.error('ERROR: Fallo al obtener producto:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  // --- Métodos para Sucursales ---

  /**
   * Crea una nueva sucursal.
   * @param nombre El nombre de la sucursal.
   * @param direccion La dirección de la sucursal.
   * @returns Observable de la Sucursal creada.
   */
  createSucursal(nombre: string, direccion: string): Observable<Sucursal> {
    console.log(`DEBUG: Llamando a createSucursal con nombre: ${nombre}, direccion: ${direccion}`);
    const request = new CreateSucursalRequest();
    request.setNombre(nombre);
    // **IMPORTANTE:** Si este error persiste, y recibes "Property 'direccion' does not exist",
    // esto sugiere que el archivo 'productos_pb.ts' *no* está generando la propiedad 'direccion'
    // directamente ni el método 'setDireccion'. Esto es un problema con la generación de Protobuf.
    // En este punto, estamos intentando el método estándar 'setDireccion()'.
    request.setDireccion(direccion); // <--- Volviendo al uso de setDireccion()

    return from(
      new Promise<Sucursal>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.createSucursal(request, {}, (err: any | null, response?: SucursalResponse) => {
          if (err) {
            console.error('ERROR: Error al crear sucursal:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Asegurar que response.getSucursal() no es undefined
          if (response && response.getSuccess()) {
            const sucursal = response.getSucursal(); // Asignar a una variable local para narrowing
            if (sucursal !== undefined) {
              console.log('DEBUG: Sucursal creada:', sucursal.toObject());
              return resolve(sucursal); // Devolver la variable local tipada correctamente
            }
          }
          const errorMessage = response ? response.getMessage() : 'Error desconocido al crear sucursal.';
          console.error('ERROR: Fallo al crear sucursal:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  /**
   * Obtiene una sucursal por su ID.
   * @param id El ID de la sucursal a obtener.
   * @returns Observable de la Sucursal obtenida.
   */
  getSucursal(id: number): Observable<Sucursal> {
    console.log(`DEBUG: Llamando a getSucursal con ID: ${id}`);
    const request = new GetSucursalRequest();
    request.setId(id);

    return from(
      new Promise<Sucursal>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.getSucursal(request, {}, (err: any | null, response?: SucursalResponse) => {
          if (err) {
            console.error('ERROR: Error al obtener sucursal:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Asegurar que response.getSucursal() no es undefined
          if (response && response.getSuccess()) {
            const sucursal = response.getSucursal(); // Asignar a una variable local para narrowing
            if (sucursal !== undefined) {
              console.log('DEBUG: Sucursal obtenida:', sucursal.toObject());
              return resolve(sucursal); // Devolver la variable local tipada correctamente
            }
          }
          const errorMessage = response ? response.getMessage() : 'Error desconocido al obtener sucursal.';
          console.error('ERROR: Fallo al obtener sucursal:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  /**
   * Obtiene la lista de todas las sucursales.
   * @returns Observable de un array de Sucursal.
   */
  listSucursales(): Observable<Sucursal[]> {
    console.log("DEBUG: Llamando a listSucursales...");
    const emptyMsg = new Empty();
    return from(
      new Promise<ListSucursalesResponse>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.listSucursales(emptyMsg, {}, (err: any | null, response?: ListSucursalesResponse) => {
          if (err) {
            console.error('ERROR: Error al listar sucursales:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de listSucursales:', response.toObject());
            // CORREGIDO: Usar getSucursalesList()
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de ListSucursales vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getSucursalesList()
      map(response => response.getSucursalesList()) // <--- CAMBIO AQUÍ: getSucursalesList()
    );
  }

  // --- Métodos para Stock ---

  /**
   * Añade stock a un producto en una sucursal.
   * @param idProducto ID del producto.
   * @param idSucursal ID de la sucursal.
   * @param cantidadA Sumar cantidad.
   * @returns Observable del StockResponse (contiene StockProducto actualizado y estado).
   */
  addStock(idProducto: number, idSucursal: number, cantidadA: number): Observable<StockResponse> { // <--- CAMBIO AQUÍ
    console.log(`DEBUG: Llamando a addStock para producto ${idProducto} en sucursal ${idSucursal}, cantidad: ${cantidadA}`);
    const request = new AddStockRequest();
    request.setIdProducto(idProducto);
    request.setIdSucursal(idSucursal);
    request.setCantidadASumar(cantidadA);

    return from(
      new Promise<StockResponse>((resolve, reject) => { // <--- CAMBIO AQUÍ
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.addStock(request, {}, (err: any | null, response?: StockResponse) => {
          if (err) {
            console.error('ERROR: Error al añadir stock:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Ahora resolvemos con el objeto StockResponse completo
          if (response && response.getSuccess()) {
            console.log('DEBUG: Stock añadido (respuesta completa):', response.toObject());
            return resolve(response); // <--- CAMBIO AQUÍ: Resolvemos con 'response'
          }
          const errorMessage = response ? response.getMessage() : 'Error desconocido al añadir stock.';
          console.error('ERROR: Fallo al añadir stock:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  /**
   * Remueve stock de un producto en una sucursal.
   * @param idProducto ID del producto.
   * @param idSucursal ID de la sucursal.
   * @param cantidadR Restar cantidad.
   * @returns Observable del StockResponse (contiene StockProducto actualizado y estado).
   */
  removeStock(idProducto: number, idSucursal: number, cantidadR: number): Observable<StockResponse> { // <--- CAMBIO AQUÍ
    console.log(`DEBUG: Llamando a removeStock para producto ${idProducto} en sucursal ${idSucursal}, cantidad: ${cantidadR}`);
    const request = new RemoveStockRequest();
    request.setIdProducto(idProducto);
    request.setIdSucursal(idSucursal);
    request.setCantidadARestar(cantidadR);

    return from(
      new Promise<StockResponse>((resolve, reject) => { // <--- CAMBIO AQUÍ
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.removeStock(request, {}, (err: any | null, response?: StockResponse) => {
          if (err) {
            console.error('ERROR: Error al remover stock:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Ahora resolvemos con el objeto StockResponse completo
          if (response && response.getSuccess()) {
            console.log('DEBUG: Stock removido (respuesta completa):', response.toObject());
            return resolve(response); // <--- CAMBIO AQUÍ: Resolvemos con 'response'
          }
          const errorMessage = response ? response.getMessage() : 'Error desconocido al remover stock.';
          console.error('ERROR: Fallo al remover stock:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  /**
   * Actualiza la cantidad y precio del stock de un producto en una sucursal.
   * @param idProducto ID del producto.
   * @param idSucursal ID de la sucursal.
   * @param nuevaCantidad Nueva cantidad del stock.
   * @param nuevoPrecio Nuevo precio del stock.
   * @returns Observable del StockResponse (contiene StockProducto actualizado y estado).
   */
  updateStock(idProducto: number, idSucursal: number, nuevaCantidad: number, nuevoPrecio: number): Observable<StockResponse> { // <--- CAMBIO AQUÍ
    console.log(`DEBUG: Llamando a updateStock para producto ${idProducto} en sucursal ${idSucursal}, nueva cantidad: ${nuevaCantidad}, nuevo precio: ${nuevoPrecio}`);
    const request = new UpdateStockRequest();
    request.setIdProducto(idProducto);
    request.setIdSucursal(idSucursal);
    request.setNuevaCantidad(nuevaCantidad);
    request.setNuevoPrecio(nuevoPrecio); // Asegurarse de que este setter existe

    return from(
      new Promise<StockResponse>((resolve, reject) => { // <--- CAMBIO AQUÍ
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.updateStock(request, {}, (err: any | null, response?: StockResponse) => {
          if (err) {
            console.error('ERROR: Error al actualizar stock:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Ahora resolvemos con el objeto StockResponse completo
          if (response && response.getSuccess()) {
            console.log('DEBUG: Stock actualizado (respuesta completa):', response.toObject());
            return resolve(response); // <--- CAMBIO AQUÍ: Resolvemos con 'response'
          }
          const errorMessage = response ? response.getMessage() : 'Error desconocido al actualizar stock.';
          console.error('ERROR: Fallo al actualizar stock:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  /**
   * Obtiene el stock de un producto específico en una sucursal específica.
   * @param idProducto ID del producto.
   * @param idSucursal ID de la sucursal.
   * @returns Observable del StockResponse (contiene StockProducto y estado).
   */
  getStock(idProducto: number, idSucursal: number): Observable<StockResponse> { // <--- CAMBIO AQUÍ
    console.log(`DEBUG: Llamando a getStock para producto ${idProducto} en sucursal ${idSucursal}`);
    const request = new GetStockRequest();
    request.setIdProducto(idProducto);
    request.setIdSucursal(idSucursal);

    return from(
      new Promise<StockResponse>((resolve, reject) => { // <--- CAMBIO AQUÍ
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.getStock(request, {}, (err: any | null, response?: StockResponse) => {
          if (err) {
            console.error('ERROR: Error al obtener stock:', err.code, err.message);
            return reject(err);
          }
          // CORREGIDO: Ahora resolvemos con el objeto StockResponse completo
          if (response && response.getSuccess()) {
            console.log('DEBUG: Stock obtenido (respuesta completa):', response.toObject());
            return resolve(response); // <--- CAMBIO AQUÍ: Resolvemos con 'response'
          }
          const errorMessage = response ? response.getMessage() : 'Stock no encontrado para el producto en la sucursal especificada.';
          console.error('ERROR: Fallo al obtener stock:', errorMessage);
          return reject(new Error(errorMessage));
        });
      })
    );
  }

  /**
   * Lista el stock de todos los productos en una sucursal específica.
   * @param idSucursal ID de la sucursal.
   * @returns Observable de un array de StockProducto.
   */
  listStockByBranch(idSucursal: number): Observable<StockProducto[]> {
    console.log(`DEBUG: Llamando a listStockByBranch para sucursal ${idSucursal}`);
    const request = new ListStockByBranchRequest();
    request.setIdSucursal(idSucursal);

    return from(
      new Promise<ListStockByBranchResponse>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.listStockByBranch(request, {}, (err: any | null, response?: ListStockByBranchResponse) => {
          if (err) {
            console.error('ERROR: Error al listar stock por sucursal:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de listStockByBranch:', response.toObject());
            // CORREGIDO: Usar getStockProductosList()
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de ListStockByBranch vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getStockProductosList()
      map(response => response.getStockProductosList()) // <--- CAMBIO AQUÍ: getStockProductosList()
    );
  }

  /**
   * Lista el stock de un producto específico en todas las sucursales.
   * @param idProducto ID del producto.
   * @returns Observable de un array de StockProducto.
   */
  listStockByProduct(idProducto: number): Observable<StockProducto[]> {
    console.log(`DEBUG: Llamando a listStockByProduct para producto ${idProducto}`);
    const request = new ListStockByProductRequest();
    request.setIdProducto(idProducto);

    return from(
      new Promise<ListStockByProductResponse>((resolve, reject) => {
        // Usamos 'any' para el tipo de 'err' y 'response' como workaround temporal
        this.client.listStockByProduct(request, {}, (err: any | null, response?: ListStockByProductResponse) => {
          if (err) {
            console.error('ERROR: Error al listar stock por producto:', err.code, err.message);
            return reject(err);
          }
          if (response) {
            console.log('DEBUG: Respuesta de listStockByProduct:', response.toObject());
            // CORREGIDO: Usar getStockProductosList()
            return resolve(response);
          } else {
            return reject(new Error('Respuesta de ListStockByProduct vacía o inválida.'));
          }
        });
      })
    ).pipe(
      // CORREGIDO: Usar getStockProductosList()
      map(response => response.getStockProductosList()) // <--- CAMBIO AQUÍ: getStockProductosList()
    );
  }
}
