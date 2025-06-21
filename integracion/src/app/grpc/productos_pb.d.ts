// package: productos
// file: productos.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class Producto extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getNombre(): string;
  setNombre(value: string): void;

  getPrecio(): number;
  setPrecio(value: number): void;

  getImagen(): Uint8Array | string;
  getImagen_asU8(): Uint8Array;
  getImagen_asB64(): string;
  setImagen(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Producto.AsObject;
  static toObject(includeInstance: boolean, msg: Producto): Producto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Producto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Producto;
  static deserializeBinaryFromReader(message: Producto, reader: jspb.BinaryReader): Producto;
}

export namespace Producto {
  export type AsObject = {
    id: number,
    nombre: string,
    precio: number,
    imagen: Uint8Array | string,
  }
}

export class StockPorSucursal extends jspb.Message {
  getIdProducto(): number;
  setIdProducto(value: number): void;

  getIdSucursal(): number;
  setIdSucursal(value: number): void;

  getCantidad(): number;
  setCantidad(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StockPorSucursal.AsObject;
  static toObject(includeInstance: boolean, msg: StockPorSucursal): StockPorSucursal.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StockPorSucursal, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StockPorSucursal;
  static deserializeBinaryFromReader(message: StockPorSucursal, reader: jspb.BinaryReader): StockPorSucursal;
}

export namespace StockPorSucursal {
  export type AsObject = {
    idProducto: number,
    idSucursal: number,
    cantidad: number,
  }
}

export class GetProductoRequest extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetProductoRequest): GetProductoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProductoRequest;
  static deserializeBinaryFromReader(message: GetProductoRequest, reader: jspb.BinaryReader): GetProductoRequest;
}

export namespace GetProductoRequest {
  export type AsObject = {
    id: number,
  }
}

export class CreateProductoRequest extends jspb.Message {
  hasProducto(): boolean;
  clearProducto(): void;
  getProducto(): Producto | undefined;
  setProducto(value?: Producto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateProductoRequest): CreateProductoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateProductoRequest;
  static deserializeBinaryFromReader(message: CreateProductoRequest, reader: jspb.BinaryReader): CreateProductoRequest;
}

export namespace CreateProductoRequest {
  export type AsObject = {
    producto?: Producto.AsObject,
  }
}

export class UpdateProductoRequest extends jspb.Message {
  hasProducto(): boolean;
  clearProducto(): void;
  getProducto(): Producto | undefined;
  setProducto(value?: Producto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateProductoRequest): UpdateProductoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateProductoRequest;
  static deserializeBinaryFromReader(message: UpdateProductoRequest, reader: jspb.BinaryReader): UpdateProductoRequest;
}

export namespace UpdateProductoRequest {
  export type AsObject = {
    producto?: Producto.AsObject,
  }
}

export class DeleteProductoRequest extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteProductoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteProductoRequest): DeleteProductoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeleteProductoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteProductoRequest;
  static deserializeBinaryFromReader(message: DeleteProductoRequest, reader: jspb.BinaryReader): DeleteProductoRequest;
}

export namespace DeleteProductoRequest {
  export type AsObject = {
    id: number,
  }
}

export class AsignarStockRequest extends jspb.Message {
  hasStockItem(): boolean;
  clearStockItem(): void;
  getStockItem(): StockPorSucursal | undefined;
  setStockItem(value?: StockPorSucursal): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AsignarStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AsignarStockRequest): AsignarStockRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AsignarStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AsignarStockRequest;
  static deserializeBinaryFromReader(message: AsignarStockRequest, reader: jspb.BinaryReader): AsignarStockRequest;
}

export namespace AsignarStockRequest {
  export type AsObject = {
    stockItem?: StockPorSucursal.AsObject,
  }
}

export class ProductoResponse extends jspb.Message {
  hasProducto(): boolean;
  clearProducto(): void;
  getProducto(): Producto | undefined;
  setProducto(value?: Producto): void;

  getMessage(): string;
  setMessage(value: string): void;

  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProductoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ProductoResponse): ProductoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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

export class ListProductosResponse extends jspb.Message {
  clearProductosList(): void;
  getProductosList(): Array<Producto>;
  setProductosList(value: Array<Producto>): void;
  addProductos(value?: Producto, index?: number): Producto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListProductosResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListProductosResponse): ListProductosResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListProductosResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListProductosResponse;
  static deserializeBinaryFromReader(message: ListProductosResponse, reader: jspb.BinaryReader): ListProductosResponse;
}

export namespace ListProductosResponse {
  export type AsObject = {
    productosList: Array<Producto.AsObject>,
  }
}

