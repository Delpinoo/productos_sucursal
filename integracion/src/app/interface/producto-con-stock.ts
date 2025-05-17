export interface ProductoConStock {
  id: number;
  nombre: string;
  descripcion?: string;
  stockPorSucursal: {
    idSucursal: number;
    nombreSucursal: string;
    cantidad: number;
    precio: number;
  }[];
}