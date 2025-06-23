import * as jspb from 'google-protobuf'

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"


export class Producto extends jspb.Message {
  getId(): number;
  setId(value: number): Producto;

  getNombre(): string;
  setNombre(value: string): Producto;

  getDescripcion(): string;
  setDescripcion(value: string): Producto;

  getImagen(): Uint8Array | string;
  getImagen_asU8(): Uint8Array;
  getImagen_asB64(): string;
  setImagen(value: Uint8Array | string): Producto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Producto.AsObject;
  static toObject(includeInstance: boolean, msg: Producto): Producto.AsObject;
  static serializeBinaryToWriter(message: Producto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Producto;
  static deserializeBinaryFromReader(message: Producto, reader: jspb.BinaryReader): Producto;
}

export namespace Producto {
  export type AsObject = {
    id: number,
    nombre: string,
    descripcion: string,
    imagen: Uint8Array | string,
  }
}

export class Sucursal extends jspb.Message {
  getId(): number;
  setId(value: number): Sucursal;

  getNombre(): string;
  setNombre(value: string): Sucursal;

  getDireccion(): string;
  setDireccion(value: string): Sucursal;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Sucursal.AsObject;
  static toObject(includeInstance: boolean, msg: Sucursal): Sucursal.AsObject;
  static serializeBinaryToWriter(message: Sucursal, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Sucursal;
  static deserializeBinaryFromReader(message: Sucursal, reader: jspb.BinaryReader): Sucursal;
}

export namespace Sucursal {
  export type AsObject = {
    id: number,
    nombre: string,
    direccion: string,
  }
}

export class StockProducto extends jspb.Message {
  getId(): number;
  setId(value: number): StockProducto;

  getIdSucursal(): number;
  setIdSucursal(value: number): StockProducto;

  getIdProducto(): number;
  setIdProducto(value: number): StockProducto;

  getCantidad(): number;
  setCantidad(value: number): StockProducto;

  getPrecio(): number;
  setPrecio(value: number): StockProducto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StockProducto.AsObject;
  static toObject(includeInstance: boolean, msg: StockProducto): StockProducto.AsObject;
  static serializeBinaryToWriter(message: StockProducto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StockProducto;
  static deserializeBinaryFromReader(message: StockProducto, reader: jspb.BinaryReader): StockProducto;
}

export namespace StockProducto {
  export type AsObject = {
    id: number,
    idSucursal: number,
    idProducto: number,
    cantidad: number,
    precio: number,
  }
}

export class Venta extends jspb.Message {
  getId(): number;
  setId(value: number): Venta;

  getFecha(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setFecha(value?: google_protobuf_timestamp_pb.Timestamp): Venta;
  hasFecha(): boolean;
  clearFecha(): Venta;

  getTotalVenta(): number;
  setTotalVenta(value: number): Venta;

  getIdSucursal(): number;
  setIdSucursal(value: number): Venta;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Venta.AsObject;
  static toObject(includeInstance: boolean, msg: Venta): Venta.AsObject;
  static serializeBinaryToWriter(message: Venta, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Venta;
  static deserializeBinaryFromReader(message: Venta, reader: jspb.BinaryReader): Venta;
}

export namespace Venta {
  export type AsObject = {
    id: number,
    fecha?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    totalVenta: number,
    idSucursal: number,
  }
}

export class DetalleVenta extends jspb.Message {
  getId(): number;
  setId(value: number): DetalleVenta;

  getIdVenta(): number;
  setIdVenta(value: number): DetalleVenta;

  getIdProducto(): number;
  setIdProducto(value: number): DetalleVenta;

  getCantidad(): number;
  setCantidad(value: number): DetalleVenta;

  getPrecioUnitario(): number;
  setPrecioUnitario(value: number): DetalleVenta;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetalleVenta.AsObject;
  static toObject(includeInstance: boolean, msg: DetalleVenta): DetalleVenta.AsObject;
  static serializeBinaryToWriter(message: DetalleVenta, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetalleVenta;
  static deserializeBinaryFromReader(message: DetalleVenta, reader: jspb.BinaryReader): DetalleVenta;
}

export namespace DetalleVenta {
  export type AsObject = {
    id: number,
    idVenta: number,
    idProducto: number,
    cantidad: number,
    precioUnitario: number,
  }
}

export class CreateProductoRequest extends jspb.Message {
  getNombre(): string;
  setNombre(value: string): CreateProductoRequest;

  getDescripcion(): string;
  setDescripcion(value: string): CreateProductoRequest;

  getImagen(): Uint8Array | string;
  getImagen_asU8(): Uint8Array;
  getImagen_asB64(): string;
  setImagen(value: Uint8Array | string): CreateProductoRequest;

  getIdSucursalInicial(): number;
  setIdSucursalInicial(value: number): CreateProductoRequest;

  getCantidadInicial(): number;
  setCantidadInicial(value: number): CreateProductoRequest;

  getPrecioInicial(): number;
  setPrecioInicial(value: number): CreateProductoRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateProductoRequest): CreateProductoRequest.AsObject;
  static serializeBinaryToWriter(message: CreateProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateProductoRequest;
  static deserializeBinaryFromReader(message: CreateProductoRequest, reader: jspb.BinaryReader): CreateProductoRequest;
}

export namespace CreateProductoRequest {
  export type AsObject = {
    nombre: string,
    descripcion: string,
    imagen: Uint8Array | string,
    idSucursalInicial: number,
    cantidadInicial: number,
    precioInicial: number,
  }
}

export class ProductoResponse extends jspb.Message {
  getProducto(): Producto | undefined;
  setProducto(value?: Producto): ProductoResponse;
  hasProducto(): boolean;
  clearProducto(): ProductoResponse;

  getMessage(): string;
  setMessage(value: string): ProductoResponse;

  getSuccess(): boolean;
  setSuccess(value: boolean): ProductoResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProductoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ProductoResponse): ProductoResponse.AsObject;
  static serializeBinaryToWriter(message: ProductoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProductoResponse;
  static deserializeBinaryFromReader(message: ProductoResponse, reader: jspb.BinaryReader): ProductoResponse;
}

export namespace ProductoResponse {
  export type AsObject = {
    producto?: Producto.AsObject,
    message: string,
    success: boolean,
  }
}

export class GetProductoRequest extends jspb.Message {
  getId(): number;
  setId(value: number): GetProductoRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetProductoRequest): GetProductoRequest.AsObject;
  static serializeBinaryToWriter(message: GetProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProductoRequest;
  static deserializeBinaryFromReader(message: GetProductoRequest, reader: jspb.BinaryReader): GetProductoRequest;
}

export namespace GetProductoRequest {
  export type AsObject = {
    id: number,
  }
}

export class SearchProductosRequest extends jspb.Message {
  getQuery(): string;
  setQuery(value: string): SearchProductosRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SearchProductosRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SearchProductosRequest): SearchProductosRequest.AsObject;
  static serializeBinaryToWriter(message: SearchProductosRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SearchProductosRequest;
  static deserializeBinaryFromReader(message: SearchProductosRequest, reader: jspb.BinaryReader): SearchProductosRequest;
}

export namespace SearchProductosRequest {
  export type AsObject = {
    query: string,
  }
}

export class ListProductosResponse extends jspb.Message {
  getProductosList(): Array<Producto>;
  setProductosList(value: Array<Producto>): ListProductosResponse;
  clearProductosList(): ListProductosResponse;
  addProductos(value?: Producto, index?: number): Producto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListProductosResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListProductosResponse): ListProductosResponse.AsObject;
  static serializeBinaryToWriter(message: ListProductosResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListProductosResponse;
  static deserializeBinaryFromReader(message: ListProductosResponse, reader: jspb.BinaryReader): ListProductosResponse;
}

export namespace ListProductosResponse {
  export type AsObject = {
    productosList: Array<Producto.AsObject>,
  }
}

export class UpdateProductoRequest extends jspb.Message {
  getId(): number;
  setId(value: number): UpdateProductoRequest;

  getNombre(): string;
  setNombre(value: string): UpdateProductoRequest;

  getDescripcion(): string;
  setDescripcion(value: string): UpdateProductoRequest;

  getImagen(): Uint8Array | string;
  getImagen_asU8(): Uint8Array;
  getImagen_asB64(): string;
  setImagen(value: Uint8Array | string): UpdateProductoRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateProductoRequest): UpdateProductoRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateProductoRequest;
  static deserializeBinaryFromReader(message: UpdateProductoRequest, reader: jspb.BinaryReader): UpdateProductoRequest;
}

export namespace UpdateProductoRequest {
  export type AsObject = {
    id: number,
    nombre: string,
    descripcion: string,
    imagen: Uint8Array | string,
  }
}

export class DeleteProductoRequest extends jspb.Message {
  getId(): number;
  setId(value: number): DeleteProductoRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteProductoRequest): DeleteProductoRequest.AsObject;
  static serializeBinaryToWriter(message: DeleteProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteProductoRequest;
  static deserializeBinaryFromReader(message: DeleteProductoRequest, reader: jspb.BinaryReader): DeleteProductoRequest;
}

export namespace DeleteProductoRequest {
  export type AsObject = {
    id: number,
  }
}

export class CreateSucursalRequest extends jspb.Message {
  getNombre(): string;
  setNombre(value: string): CreateSucursalRequest;

  getDireccion(): string;
  setDireccion(value: string): CreateSucursalRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateSucursalRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateSucursalRequest): CreateSucursalRequest.AsObject;
  static serializeBinaryToWriter(message: CreateSucursalRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateSucursalRequest;
  static deserializeBinaryFromReader(message: CreateSucursalRequest, reader: jspb.BinaryReader): CreateSucursalRequest;
}

export namespace CreateSucursalRequest {
  export type AsObject = {
    nombre: string,
    direccion: string,
  }
}

export class SucursalResponse extends jspb.Message {
  getSucursal(): Sucursal | undefined;
  setSucursal(value?: Sucursal): SucursalResponse;
  hasSucursal(): boolean;
  clearSucursal(): SucursalResponse;

  getMessage(): string;
  setMessage(value: string): SucursalResponse;

  getSuccess(): boolean;
  setSuccess(value: boolean): SucursalResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SucursalResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SucursalResponse): SucursalResponse.AsObject;
  static serializeBinaryToWriter(message: SucursalResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SucursalResponse;
  static deserializeBinaryFromReader(message: SucursalResponse, reader: jspb.BinaryReader): SucursalResponse;
}

export namespace SucursalResponse {
  export type AsObject = {
    sucursal?: Sucursal.AsObject,
    message: string,
    success: boolean,
  }
}

export class GetSucursalRequest extends jspb.Message {
  getId(): number;
  setId(value: number): GetSucursalRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetSucursalRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetSucursalRequest): GetSucursalRequest.AsObject;
  static serializeBinaryToWriter(message: GetSucursalRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetSucursalRequest;
  static deserializeBinaryFromReader(message: GetSucursalRequest, reader: jspb.BinaryReader): GetSucursalRequest;
}

export namespace GetSucursalRequest {
  export type AsObject = {
    id: number,
  }
}

export class ListSucursalesResponse extends jspb.Message {
  getSucursalesList(): Array<Sucursal>;
  setSucursalesList(value: Array<Sucursal>): ListSucursalesResponse;
  clearSucursalesList(): ListSucursalesResponse;
  addSucursales(value?: Sucursal, index?: number): Sucursal;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSucursalesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListSucursalesResponse): ListSucursalesResponse.AsObject;
  static serializeBinaryToWriter(message: ListSucursalesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSucursalesResponse;
  static deserializeBinaryFromReader(message: ListSucursalesResponse, reader: jspb.BinaryReader): ListSucursalesResponse;
}

export namespace ListSucursalesResponse {
  export type AsObject = {
    sucursalesList: Array<Sucursal.AsObject>,
  }
}

export class AddStockRequest extends jspb.Message {
  getIdProducto(): number;
  setIdProducto(value: number): AddStockRequest;

  getIdSucursal(): number;
  setIdSucursal(value: number): AddStockRequest;

  getCantidadASumar(): number;
  setCantidadASumar(value: number): AddStockRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddStockRequest): AddStockRequest.AsObject;
  static serializeBinaryToWriter(message: AddStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddStockRequest;
  static deserializeBinaryFromReader(message: AddStockRequest, reader: jspb.BinaryReader): AddStockRequest;
}

export namespace AddStockRequest {
  export type AsObject = {
    idProducto: number,
    idSucursal: number,
    cantidadASumar: number,
  }
}

export class RemoveStockRequest extends jspb.Message {
  getIdProducto(): number;
  setIdProducto(value: number): RemoveStockRequest;

  getIdSucursal(): number;
  setIdSucursal(value: number): RemoveStockRequest;

  getCantidadARestar(): number;
  setCantidadARestar(value: number): RemoveStockRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveStockRequest): RemoveStockRequest.AsObject;
  static serializeBinaryToWriter(message: RemoveStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveStockRequest;
  static deserializeBinaryFromReader(message: RemoveStockRequest, reader: jspb.BinaryReader): RemoveStockRequest;
}

export namespace RemoveStockRequest {
  export type AsObject = {
    idProducto: number,
    idSucursal: number,
    cantidadARestar: number,
  }
}

export class UpdateStockRequest extends jspb.Message {
  getIdProducto(): number;
  setIdProducto(value: number): UpdateStockRequest;

  getIdSucursal(): number;
  setIdSucursal(value: number): UpdateStockRequest;

  getNuevaCantidad(): number;
  setNuevaCantidad(value: number): UpdateStockRequest;

  getNuevoPrecio(): number;
  setNuevoPrecio(value: number): UpdateStockRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateStockRequest): UpdateStockRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateStockRequest;
  static deserializeBinaryFromReader(message: UpdateStockRequest, reader: jspb.BinaryReader): UpdateStockRequest;
}

export namespace UpdateStockRequest {
  export type AsObject = {
    idProducto: number,
    idSucursal: number,
    nuevaCantidad: number,
    nuevoPrecio: number,
  }
}

export class GetStockRequest extends jspb.Message {
  getIdProducto(): number;
  setIdProducto(value: number): GetStockRequest;

  getIdSucursal(): number;
  setIdSucursal(value: number): GetStockRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetStockRequest): GetStockRequest.AsObject;
  static serializeBinaryToWriter(message: GetStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetStockRequest;
  static deserializeBinaryFromReader(message: GetStockRequest, reader: jspb.BinaryReader): GetStockRequest;
}

export namespace GetStockRequest {
  export type AsObject = {
    idProducto: number,
    idSucursal: number,
  }
}

export class StockResponse extends jspb.Message {
  getStockProducto(): StockProducto | undefined;
  setStockProducto(value?: StockProducto): StockResponse;
  hasStockProducto(): boolean;
  clearStockProducto(): StockResponse;

  getMessage(): string;
  setMessage(value: string): StockResponse;

  getSuccess(): boolean;
  setSuccess(value: boolean): StockResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StockResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StockResponse): StockResponse.AsObject;
  static serializeBinaryToWriter(message: StockResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StockResponse;
  static deserializeBinaryFromReader(message: StockResponse, reader: jspb.BinaryReader): StockResponse;
}

export namespace StockResponse {
  export type AsObject = {
    stockProducto?: StockProducto.AsObject,
    message: string,
    success: boolean,
  }
}

export class ListStockByProductRequest extends jspb.Message {
  getIdProducto(): number;
  setIdProducto(value: number): ListStockByProductRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStockByProductRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListStockByProductRequest): ListStockByProductRequest.AsObject;
  static serializeBinaryToWriter(message: ListStockByProductRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStockByProductRequest;
  static deserializeBinaryFromReader(message: ListStockByProductRequest, reader: jspb.BinaryReader): ListStockByProductRequest;
}

export namespace ListStockByProductRequest {
  export type AsObject = {
    idProducto: number,
  }
}

export class ListStockByProductResponse extends jspb.Message {
  getStockProductosList(): Array<StockProducto>;
  setStockProductosList(value: Array<StockProducto>): ListStockByProductResponse;
  clearStockProductosList(): ListStockByProductResponse;
  addStockProductos(value?: StockProducto, index?: number): StockProducto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStockByProductResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListStockByProductResponse): ListStockByProductResponse.AsObject;
  static serializeBinaryToWriter(message: ListStockByProductResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStockByProductResponse;
  static deserializeBinaryFromReader(message: ListStockByProductResponse, reader: jspb.BinaryReader): ListStockByProductResponse;
}

export namespace ListStockByProductResponse {
  export type AsObject = {
    stockProductosList: Array<StockProducto.AsObject>,
  }
}

export class ListStockByBranchRequest extends jspb.Message {
  getIdSucursal(): number;
  setIdSucursal(value: number): ListStockByBranchRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStockByBranchRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListStockByBranchRequest): ListStockByBranchRequest.AsObject;
  static serializeBinaryToWriter(message: ListStockByBranchRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStockByBranchRequest;
  static deserializeBinaryFromReader(message: ListStockByBranchRequest, reader: jspb.BinaryReader): ListStockByBranchRequest;
}

export namespace ListStockByBranchRequest {
  export type AsObject = {
    idSucursal: number,
  }
}

export class ListStockByBranchResponse extends jspb.Message {
  getStockProductosList(): Array<StockProducto>;
  setStockProductosList(value: Array<StockProducto>): ListStockByBranchResponse;
  clearStockProductosList(): ListStockByBranchResponse;
  addStockProductos(value?: StockProducto, index?: number): StockProducto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStockByBranchResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListStockByBranchResponse): ListStockByBranchResponse.AsObject;
  static serializeBinaryToWriter(message: ListStockByBranchResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStockByBranchResponse;
  static deserializeBinaryFromReader(message: ListStockByBranchResponse, reader: jspb.BinaryReader): ListStockByBranchResponse;
}

export namespace ListStockByBranchResponse {
  export type AsObject = {
    stockProductosList: Array<StockProducto.AsObject>,
  }
}

