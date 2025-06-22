import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common'; // CommonModule ya estaba aquí
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Necesario para la API de conversión

// Importamos el nuevo servicio gRPC
import { ProductosGrpcService } from '../../grpc/productos-grpc.service';
// Importamos los tipos de Protobuf que vamos a usar
// Asegúrate de que StockResponse esté importado correctamente
import { Producto, Sucursal, StockProducto, StockResponse } from '../../grpc/productos_pb';

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
  sucursalesData?: Sucursal[]; // Para facilitar el acceso a nombres de sucursales
}

@Component({
  selector: 'app-lista-sucursales',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: './lista-sucursales.component.html',
  styleUrls: ['./lista-sucursales.component.css']
})
export class ListaSucursalesComponent implements OnInit {
  // Cambiamos el tipo del Input a nuestra interfaz definida
  @Input() productos: ProductoConStock[] = [];
  
  // Lista de sucursales que cargaremos vía gRPC
  sucursales: Sucursal[] = [];

  sucursalSeleccionada: { [productoId: number]: number } = {};
  cantidadAComprar: { [productoId: number]: number } = {}
  precioEnCLP: { [productoId: number]: number } = {};
  private apiUrlConversion = 'https://v6.exchangerate-api.com/v6/0fb1bdc55aa4225aceae3b5a/latest/USD';

  constructor(
    private http: HttpClient, // Mantenemos HttpClient para la API de conversión de moneda
    private productosGrpcService: ProductosGrpcService // Inyectamos nuestro servicio gRPC
  ) { }

  ngOnInit(): void {
    console.log('Productos recibidos en ListaSucursales (antes de gRPC):', this.productos);
    this.cargarSucursales();
  }

  // Nuevo método para cargar sucursales usando gRPC
  private cargarSucursales(): void {
    this.productosGrpcService.listSucursales().subscribe(
      (data: Sucursal[]) => {
        this.sucursales = data;
        console.log('Sucursales cargadas (gRPC):', this.sucursales);
      },
      (error) => {
        console.error('Error al cargar sucursales (gRPC):', error);
        // Manejo de error: podrías mostrar un mensaje al usuario
      }
    );
  }

  private resetearEstadoVenta(productoId: number): void {
    this.precioEnCLP[productoId] = 0;
    this.cantidadAComprar[productoId] = 0;
    this.sucursalSeleccionada[productoId] = 0;
  }

  seleccionarSucursal(productoId: number, event: any): void {
    this.sucursalSeleccionada[productoId] = parseInt(event.target.value, 10);
    console.log(`Sucursal seleccionada para el producto ${productoId}:`, this.sucursalSeleccionada[productoId]);
  }

  actualizarCantidadAComprar(productoId: number, event: any): void {
    this.cantidadAComprar[productoId] = parseInt(event.target.value, 10) || 1;
    this.precioEnCLP[productoId] = 0;
  }

  // getNombreSucursal toma el ID de la sucursal y busca el nombre en la lista de sucursales cargadas.
  getNombreSucursal(sucursalId: number): string {
    const sucursal = this.sucursales.find(s => s.getId() === sucursalId); // Usar .getId() para Protobuf
    return sucursal ? sucursal.getNombre() : 'Desconocida'; // Usar .getNombre()
  }

  calcularPrecioCLP(producto: ProductoConStock): void {
    const sucursalId = this.sucursalSeleccionada[producto.getId()]; // Usar .getId()
    const cantidad = this.cantidadAComprar[producto.getId()]; // Usar .getId()

    if (sucursalId && cantidad > 0) {
      // Buscar el stock correcto por sucursal
      // CORRECCIÓN: Usar getIdSucursal() en lugar de getSucursalId()
      const stockParaSucursal = producto.stock_productos.find(stock => stock.getIdSucursal() === sucursalId); 

      if (stockParaSucursal && stockParaSucursal.getPrecio() !== undefined) { // Usar .getPrecio()
        const precioUSD = stockParaSucursal.getPrecio();

        const apiKey = '0fb1bdc55aa4225aceae3b5a';
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

        this.http.get<any>(url).subscribe(
          (data) => {
            console.log('Respuesta de la API de conversión:', data);
            const tasaCambioCLP = data.conversion_rates.CLP;

            if (tasaCambioCLP) {
              // Asegúrate de que precioUSD es un número antes de la multiplicación
              this.precioEnCLP[producto.getId()] = parseFloat(precioUSD.toString()) * parseFloat(tasaCambioCLP) * cantidad;
              console.log(`Precio total en CLP para ${producto.getNombre()} (${cantidad} unidades):`, this.precioEnCLP[producto.getId()]);
            } else {
              console.error('No se encontró la tasa de cambio para CLP en la respuesta de la API.');
              alert('No se pudo calcular el precio total en CLP.');
            }
          },
          (error) => {
            console.error('Error al obtener la tasa de cambio:', error);
            alert('No se pudo calcular el precio total en CLP.');
          }
        );
      } else {
        alert('No se encontró el precio en USD para la sucursal seleccionada o el stock es inválido.');
      }
    } else {
      alert('Por favor, selecciona una sucursal e ingresa una cantidad válida.');
    }
  }

  // --- FUNCIÓN REALIZAR VENTA MODIFICADA PARA GRPc ---
  realizarVenta(producto: ProductoConStock): void {
    const sucursalId = this.sucursalSeleccionada[producto.getId()];
    const cantidadAComprar = this.cantidadAComprar[producto.getId()];

    if (!sucursalId || cantidadAComprar <= 0) {
      alert('Por favor, selecciona una sucursal e ingresa una cantidad válida.');
      return;
    }

    // CORRECCIÓN: Usar getIdSucursal() en lugar de getSucursalId()
    const productoEnStock = producto.stock_productos.find(
      (stock) => stock.getIdSucursal() === sucursalId
    );

    if (!productoEnStock) {
      alert('Información de stock para la sucursal seleccionada no encontrada.');
      return;
    }

    const stockDisponible = productoEnStock.getCantidad(); // Usar .getCantidad()

    if (stockDisponible === 0) {
      alert(`El stock de ${producto.getNombre()} en ${this.getNombreSucursal(sucursalId)} está agotado.`);
      return;
    }

    if (cantidadAComprar > stockDisponible) {
      alert(`No hay suficiente stock de ${producto.getNombre()} en ${this.getNombreSucursal(sucursalId)}. Stock disponible: ${stockDisponible}`);
      return;
    }

    // --- Lógica gRPC para remover stock ---
    // CORRECCIÓN: El tipo de 'response' es StockResponse, no StockProducto
    this.productosGrpcService.removeStock(producto.getId(), sucursalId, cantidadAComprar).subscribe(
      (response: StockResponse) => { // <--- Tipo de respuesta corregido aquí
        if (response.getSuccess()) { // <--- Acceso correcto a getSuccess()
          console.log('Stock actualizado exitosamente (gRPC):', response.toObject());
          alert(`Venta exitosa de ${cantidadAComprar} unidades de ${producto.getNombre()} en ${this.getNombreSucursal(sucursalId)}.`);

          // Actualizar el stock en el frontend directamente desde la respuesta gRPC
          // Acceso correcto al StockProducto dentro de StockResponse
          productoEnStock.setCantidad(response.getStockProducto()?.getCantidad() || 0); // <--- Acceso correcto a getStockProducto() y getCantidad()
          
          // NOTA: La lógica para registrar la venta en la tabla 'ventas' y 'detalles_venta'
          // AÚN NO ESTÁ IMPLEMENTADA en el servicio gRPC.
          // Solo estamos actualizando el stock. Para una venta completa, necesitarías:
          // 1. Un nuevo mensaje y RPC para 'CreateVenta' en productos.proto.
          // 2. Un nuevo mensaje y RPC para 'AddDetalleVenta' en productos.proto.
          // 3. Implementar estos RPCs en tu app_grpc_server.py.
          // 4. Llamar a estos nuevos métodos en este componente después de remover el stock.
          console.warn('ADVERTENCIA: La venta aún NO ha sido registrada en la tabla de ventas. Solo se ha actualizado el stock.');
          
          this.resetearEstadoVenta(producto.getId());
        } else {
          // Acceso correcto a getMessage()
          console.error('Error al actualizar stock (gRPC):', response.getMessage()); 
          alert(`Error al registrar la venta: ${response.getMessage()}`); // <--- Acceso correcto a getMessage()
        }
      },
      (error) => {
        console.error('Error en la llamada gRPC para remover stock:', error);
        alert('Hubo un error de comunicación gRPC al registrar la venta. Por favor, inténtalo de nuevo.');
      }
    );
  }
}
