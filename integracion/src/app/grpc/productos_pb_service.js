// package: productos
// file: productos.proto

var productos_pb = require("./productos_pb");
var google_protobuf_empty_pb = require("google-protobuf/google/protobuf/empty_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var ProductosService = (function () {
  function ProductosService() {}
  ProductosService.serviceName = "productos.ProductosService";
  return ProductosService;
}());

ProductosService.GetProducto = {
  methodName: "GetProducto",
  service: ProductosService,
  requestStream: false,
  responseStream: false,
  requestType: productos_pb.GetProductoRequest,
  responseType: productos_pb.ProductoResponse
};

ProductosService.CreateProducto = {
  methodName: "CreateProducto",
  service: ProductosService,
  requestStream: false,
  responseStream: false,
  requestType: productos_pb.CreateProductoRequest,
  responseType: productos_pb.ProductoResponse
};

ProductosService.UpdateProducto = {
  methodName: "UpdateProducto",
  service: ProductosService,
  requestStream: false,
  responseStream: false,
  requestType: productos_pb.UpdateProductoRequest,
  responseType: productos_pb.ProductoResponse
};

ProductosService.DeleteProducto = {
  methodName: "DeleteProducto",
  service: ProductosService,
  requestStream: false,
  responseStream: false,
  requestType: productos_pb.DeleteProductoRequest,
  responseType: productos_pb.ProductoResponse
};

ProductosService.ListProductos = {
  methodName: "ListProductos",
  service: ProductosService,
  requestStream: false,
  responseStream: false,
  requestType: google_protobuf_empty_pb.Empty,
  responseType: productos_pb.ListProductosResponse
};

ProductosService.AsignarStock = {
  methodName: "AsignarStock",
  service: ProductosService,
  requestStream: false,
  responseStream: false,
  requestType: productos_pb.AsignarStockRequest,
  responseType: productos_pb.ProductoResponse
};

exports.ProductosService = ProductosService;

function ProductosServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ProductosServiceClient.prototype.getProducto = function getProducto(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProductosService.GetProducto, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ProductosServiceClient.prototype.createProducto = function createProducto(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProductosService.CreateProducto, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ProductosServiceClient.prototype.updateProducto = function updateProducto(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProductosService.UpdateProducto, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ProductosServiceClient.prototype.deleteProducto = function deleteProducto(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProductosService.DeleteProducto, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ProductosServiceClient.prototype.listProductos = function listProductos(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProductosService.ListProductos, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ProductosServiceClient.prototype.asignarStock = function asignarStock(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProductosService.AsignarStock, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.ProductosServiceClient = ProductosServiceClient;

