import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GrpcWebClientBase } from 'grpc-web';
// REMUEVE CUALQUIER LINEA QUE IMPORTE BrowserHeaders O Metadata

// Importa los mensajes y el servicio generados
import { Producto, GetProductoRequest, ProductoResponse, ListProductosResponse } from './grpc/productos_pb';
import { ProductosServiceClient } from './grpc/productos_pb_service';

// Si usas el tipo Empty de google.protobuf
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';


@Injectable({
  providedIn: 'root'
})
export class ProductsGrpcService {

  private client: ProductosServiceClient;
  private host: string = 'http://localhost:8080'; // La URL de tu Envoy Proxy

  constructor(private http: HttpClient) {
    this.client = new ProductosServiceClient(this.host);
  }

  // Método para obtener un producto por ID
  getProducto(id: number): Promise<ProductoResponse> {
    return new Promise((resolve, reject) => {
      const request = new GetProductoRequest();
      request.setId(id);

      // ¡Cambio clave aquí!: Pasar un objeto literal vacío y usar 'as any'
      this.client.getProducto(request, {} as any, (err, response) => {
        if (err) {
          console.error('Error al obtener producto:', err.code, err.message);
          return reject(err);
        }
        if (response) {
          resolve(response);
        } else {
          reject(new Error('Respuesta de GetProducto vacía o inválida.'));
        }
      });
    });
  }

  // Método para listar todos los productos
  listProductos(): Promise<ListProductosResponse> {
    return new Promise((resolve, reject) => {
      const request = new Empty();

      // ¡Cambio clave aquí!: Pasar un objeto literal vacío y usar 'as any'
      this.client.listProductos(request, {} as any, (err, response) => {
        if (err) {
          console.error('Error al listar productos:', err.code, err.message);
          return reject(err);
        }
        if (response) {
          resolve(response);
        } else {
          reject(new Error('Respuesta de ListProductos vacía o inválida.'));
        }
      });
    });
  }

  // Resto de tus métodos...
}