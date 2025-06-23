import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

// Importamos el nuevo servicio gRPC
import { ProductosGrpcService } from '../../grpc/productos-grpc.service';
// Importamos los tipos de Protobuf que vamos a usar
import { Producto, Sucursal, StockProducto, StockResponse } from '../../grpc/productos_pb';

// Importa ProductoConStock desde su ubicación centralizada
import { ProductoConStock } from '../../interface/producto-con-stock'; // <-- NUEVO: Importa desde aquí

// ... el resto de tu código

// Definición de una interfaz ProductoConStock que combine los tipos Protobuf
// Esto es para que el @Input() 'productos' tenga una estructura clara
// y combine la información del Producto con su stock de varias sucursales.
// Es importante que el componente padre pase los datos en este formato.
export interface ProductoConStock extends Producto {
  // `stock_productos` es el nombre del campo repeated en ListStockByProductResponse de Protobuf
  stock_productos: StockProducto[];
  // Opcional: Si el padre adjunta el nombre de la sucursal para fácil acceso en la UI.
  // Podríamos cargar esto aquí también si fuera necesario, pero por ahora asumimos que viene del padre
  // o lo obtenemos de la lista de `sucursales` que cargamos.
}

@Component({
  selector: 'app-lista-sucursales',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: './lista-sucursales.component.html',
  styleUrl: './lista-sucursales.component.css'
})
export class ListaSucursalesComponent implements OnInit {
  @Input() productos: ProductoConStock[] = [];

  // Mapea ID de producto a la cantidad a vender
  cantidadVenta: { [productId: number]: number } = {};
  // Mapea ID de producto a la sucursal de la que se venderá
  sucursalVenta: { [productId: number]: number } = {};
  // Mapea ID de producto al estado de venta
  estadoVenta: { [productId: number]: 'pendiente' | 'vendido' | 'error' | null } = {};

  sucursales: Sucursal[] = []; // Para almacenar las sucursales cargadas
  valorDolar: number = 0; // Para almacenar el valor actual del dólar

  constructor(
    private productosGrpcService: ProductosGrpcService,
    private http: HttpClient, // Lo mantengo por si lo usas en otro lado
    private apiService: ApiService // <-- NUEVO: Inyecta ApiService
  ) {}

  ngOnInit(): void {
    // Inicializar cantidadVenta y sucursalVenta para cada producto
    this.productos.forEach(producto => {
      this.cantidadVenta[producto.getId()] = 1; // Valor por defecto
      // Si tiene stock, selecciona la primera sucursal como predeterminada
      if (producto.stock_productos && producto.stock_productos.length > 0) {
        this.sucursalVenta[producto.getId()] = producto.stock_productos[0].getIdSucursal();
      }
    });

    this.cargarSucursales();
    this.actualizarValorDolar();
  }

  cargarSucursales(): void {
    // Reemplazado: Usa ApiService para obtener sucursales
    this.apiService.getSucursales().subscribe(
      (data: any[]) => { // Asumiendo que `getSucursales` retorna un array de objetos
        this.sucursales = data.map(s => {
          const sucursal = new Sucursal();
          sucursal.setId(s.id_sucursal);
          sucursal.setNombre(s.nombre);
          sucursal.setDireccion(s.direccion);
          return sucursal;
        });
        console.log('Sucursales cargadas:', this.sucursales);
      },
      (error: any) => { // Tipo explícito para 'error'
        console.error('Error al cargar sucursales:', error);
      }
    );
  }

  getNombreSucursal(idSucursal: number): string {
    const sucursal = this.sucursales.find(s => s.getId() === idSucursal);
    return sucursal ? sucursal.getNombre() : 'Desconocida';
  }

  // Método para actualizar el valor del dólar desde una API externa
  actualizarValorDolar(): void {
    this.apiService.getDolarValue().subscribe(
      (data: any) => { // Tipo explícito para 'data'
        // Asumiendo que la API devuelve un array y necesitamos el valor del dólar blue o similar
        // Ajusta la lógica según la estructura de la respuesta de tu API de dólar.
        const dolarBlue = data.find((d: any) => d.casa.nombre === 'Dolar Blue');
        if (dolarBlue && dolarBlue.casa.venta) {
          this.valorDolar = parseFloat(dolarBlue.casa.venta.replace(',', '.'));
          console.log('Valor del dólar actualizado:', this.valorDolar);
        }
      },
      (error: any) => { // Tipo explícito para 'error'
        console.error('Error al obtener el valor del dólar:', error);
        this.valorDolar = 0; // Resetea si hay error
      }
    );
  }

  // Método para obtener el precio en dólares
  obtenerPrecioEnDolar(producto: ProductoConStock): number {
    if (this.valorDolar > 0 && producto.stock_productos && producto.stock_productos.length > 0) {
      // Asume que el precio a convertir es el del primer stock_producto o ajusta según tu lógica
      return producto.stock_productos[0].getPrecio() / this.valorDolar;
    }
    return 0; // O un valor por defecto si no hay valor de dólar o stock
  }


  // Función para manejar la venta de un producto
  venderProducto(producto: ProductoConStock): void {
    const cantidad = this.cantidadVenta[producto.getId()];
    const idSucursalSeleccionada = this.sucursalVenta[producto.getId()];

    if (!cantidad || cantidad <= 0) {
      alert('Por favor, ingresa una cantidad válida para vender.');
      return;
    }

    if (!idSucursalSeleccionada) {
      alert('Por favor, selecciona una sucursal.');
      return;
    }

    const stockActual = producto.stock_productos.find(
      (sp) => sp.getIdSucursal() === idSucursalSeleccionada
    );

    if (!stockActual || stockActual.getCantidad() < cantidad) {
      alert(
        `No hay suficiente stock en la sucursal seleccionada. Stock disponible: ${stockActual ? stockActual.getCantidad() : 0
        }`
      );
      return;
    }

    this.estadoVenta[producto.getId()] = 'pendiente';

    // Llamada al servicio gRPC para remover stock
    // CAMBIO IMPORTANTE: Ahora se pasan 3 argumentos separados
    this.productosGrpcService.removeStock(
      producto.getId(),      // idProducto
      idSucursalSeleccionada, // idSucursal
      cantidad                // cantidad
    ).subscribe(
      (response: StockResponse.AsObject) => { // Tipo StockResponse.AsObject
        if (response.success) {
          alert('¡Venta registrada con éxito!');
          // Actualizar el stock en el frontend (en el objeto 'producto' local)
          const productoEnStock = producto.stock_productos.find(
            (sp) => sp.getIdSucursal() === idSucursalSeleccionada
          );

          if (productoEnStock) {
            // Acceso directo a propiedades de StockProducto.AsObject
            productoEnStock.setCantidad(response.stockProducto?.cantidad || 0);

            console.warn('ADVERTENCIA: La venta aún NO ha sido registrada en la tabla de ventas. Solo se ha actualizado el stock.');

            this.resetearEstadoVenta(producto.getId());
          }
        } else {
          // Acceso directo a propiedades de StockResponse.AsObject
          console.error('Error al actualizar stock (gRPC):', response.message);
          alert(`Error al registrar la venta: ${response.message}`);
        }
      },
      (error: any) => {
        console.error('Error en la llamada gRPC para remover stock:', error);
        alert('Hubo un error de comunicación gRPC al registrar la venta. Por favor, inténtalo de nuevo.');
      }
    );
  }

  // Resetea el estado de venta de un producto después de una operación
  resetearEstadoVenta(productoId: number): void {
    this.estadoVenta[productoId] = null;
    this.cantidadVenta[productoId] = 1; // Resetea la cantidad a 1
    // Mantén la sucursal seleccionada si el usuario la había cambiado
  }
}