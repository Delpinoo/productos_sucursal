// package: productos
// file: productos.proto

import * as productos_pb from "./productos_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ProductosServiceGetProducto = {
  readonly methodName: string;
  readonly service: typeof ProductosService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof productos_pb.GetProductoRequest;
  readonly responseType: typeof productos_pb.ProductoResponse;
};

type ProductosServiceCreateProducto = {
  readonly methodName: string;
  readonly service: typeof ProductosService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof productos_pb.CreateProductoRequest;
  readonly responseType: typeof productos_pb.ProductoResponse;
};

type ProductosServiceUpdateProducto = {
  readonly methodName: string;
  readonly service: typeof ProductosService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof productos_pb.UpdateProductoRequest;
  readonly responseType: typeof productos_pb.ProductoResponse;
};

type ProductosServiceDeleteProducto = {
  readonly methodName: string;
  readonly service: typeof ProductosService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof productos_pb.DeleteProductoRequest;
  readonly responseType: typeof productos_pb.ProductoResponse;
};

type ProductosServiceListProductos = {
  readonly methodName: string;
  readonly service: typeof ProductosService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof google_protobuf_empty_pb.Empty;
  readonly responseType: typeof productos_pb.ListProductosResponse;
};

type ProductosServiceAsignarStock = {
  readonly methodName: string;
  readonly service: typeof ProductosService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof productos_pb.AsignarStockRequest;
  readonly responseType: typeof productos_pb.ProductoResponse;
};

export class ProductosService {
  static readonly serviceName: string;
  static readonly GetProducto: ProductosServiceGetProducto;
  static readonly CreateProducto: ProductosServiceCreateProducto;
  static readonly UpdateProducto: ProductosServiceUpdateProducto;
  static readonly DeleteProducto: ProductosServiceDeleteProducto;
  static readonly ListProductos: ProductosServiceListProductos;
  static readonly AsignarStock: ProductosServiceAsignarStock;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class ProductosServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getProducto(
    requestMessage: productos_pb.GetProductoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  getProducto(
    requestMessage: productos_pb.GetProductoRequest,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  createProducto(
    requestMessage: productos_pb.CreateProductoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  createProducto(
    requestMessage: productos_pb.CreateProductoRequest,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  updateProducto(
    requestMessage: productos_pb.UpdateProductoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  updateProducto(
    requestMessage: productos_pb.UpdateProductoRequest,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  deleteProducto(
    requestMessage: productos_pb.DeleteProductoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  deleteProducto(
    requestMessage: productos_pb.DeleteProductoRequest,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  listProductos(
    requestMessage: google_protobuf_empty_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ListProductosResponse|null) => void
  ): UnaryResponse;
  listProductos(
    requestMessage: google_protobuf_empty_pb.Empty,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ListProductosResponse|null) => void
  ): UnaryResponse;
  asignarStock(
    requestMessage: productos_pb.AsignarStockRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
  asignarStock(
    requestMessage: productos_pb.AsignarStockRequest,
    callback: (error: ServiceError|null, responseMessage: productos_pb.ProductoResponse|null) => void
  ): UnaryResponse;
}

