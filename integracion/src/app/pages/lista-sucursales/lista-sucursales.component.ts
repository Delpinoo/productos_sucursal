import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ProductoConStock } from '../../interface/producto-con-stock';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-lista-sucursales',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: './lista-sucursales.component.html',
  styleUrls: ['./lista-sucursales.component.css']
})
export class ListaSucursalesComponent implements OnInit {
  @Input() productos: any[] = [];
  sucursalSeleccionada: { [productoId: number]: number } = {};
  cantidadAComprar: { [productoId: number]: number } = {}
  precioEnCLP: { [productoId: number]: number } = {};
  private apiUrlConversion = 'https://v6.exchangerate-api.com/v6/0fb1bdc55aa4225aceae3b5a/latest/USD';
  private resetearEstadoVenta(productoId: number): void {
    this.precioEnCLP[productoId] = 0;
    this.cantidadAComprar[productoId] = 0;
    this.sucursalSeleccionada[productoId] = 0;
  }


  constructor(private http: HttpClient, private apiService: ApiService) { }

  seleccionarSucursal(productoId: number, event: any): void {
    this.sucursalSeleccionada[productoId] = parseInt(event.target.value, 10);
    console.log(`Sucursal seleccionada para el producto ${productoId}:`, this.sucursalSeleccionada[productoId]);
  }

  actualizarCantidadAComprar(productoId: number, event: any): void {
    this.cantidadAComprar[productoId] = parseInt(event.target.value, 10) || 1;
    this.precioEnCLP[productoId] = 0;

  }

  calcularPrecioCLP(producto: ProductoConStock): void {
    const sucursalId = this.sucursalSeleccionada[producto.id];
    const cantidad = this.cantidadAComprar[producto.id];

    if (sucursalId && cantidad > 0) {
      const precioUSD = producto.stockPorSucursal.find(stock => stock.idSucursal === sucursalId)?.precio;

      if (precioUSD !== undefined) {
        const apiKey = '0fb1bdc55aa4225aceae3b5a'; 
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

        this.http.get<any>(url).subscribe(
          (data) => {
            console.log('Respuesta de la API de conversión:', data);
            const tasaCambioCLP = data.conversion_rates.CLP;

            if (tasaCambioCLP) {
              this.precioEnCLP[producto.id] = parseFloat(precioUSD.toString()) * parseFloat(tasaCambioCLP) * cantidad;
              console.log(`Precio total en CLP para ${producto.nombre} (${cantidad} unidades):`, this.precioEnCLP[producto.id]);
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
        alert('No se encontró el precio en USD para la sucursal seleccionada.');
      }
    } else {
      alert('Por favor, selecciona una sucursal e ingresa una cantidad válida.');
    }
  }

   // --- FUNCIÓN REALIZAR VENTA MODIFICADA ---
  realizarVenta(producto: ProductoConStock): void {
    const sucursalId = this.sucursalSeleccionada[producto.id];
    const cantidadAComprar = this.cantidadAComprar[producto.id];

    if (!sucursalId || cantidadAComprar <= 0) {
      alert('Por favor, selecciona una sucursal e ingresa una cantidad válida.');
      return;
    }

    const productoEnSucursal = producto.stockPorSucursal.find(
      (stock) => stock.idSucursal === sucursalId
    );

    if (!productoEnSucursal) {
      alert('Información de stock para la sucursal seleccionada no encontrada.');
      return;
    }

    const stockDisponible = productoEnSucursal.cantidad;

    if (stockDisponible === 0) {
      alert(`El stock de ${producto.nombre} en ${productoEnSucursal.nombreSucursal} está agotado.`);
      return;
    }

    if (cantidadAComprar > stockDisponible) {
      alert(`No hay suficiente stock de ${producto.nombre} en ${productoEnSucursal.nombreSucursal}. Stock disponible: ${stockDisponible}`);
      return;
    }

    // Preparar los datos para enviar a Flask
    const datosVenta = {
      id_producto: producto.id,
      cantidad: cantidadAComprar
    };

    // Llamar al ApiService para registrar la venta en el backend
    this.apiService.registrarVenta(sucursalId, [datosVenta]).subscribe(
      (response) => {
        console.log('Venta registrada exitosamente en el backend:', response);
        alert(`Venta exitosa de ${cantidadAComprar} unidades de ${producto.nombre} en ${productoEnSucursal.nombreSucursal}.`);
        
        // Opcional: Actualizar el stock en el frontend después de una respuesta exitosa del backend
        // para mantener la UI sincronizada, aunque Flask ya actualizó la DB.
        productoEnSucursal.cantidad -= cantidadAComprar; 

        this.resetearEstadoVenta(producto.id);
      },
      (error) => {
        console.error('Error al registrar la venta en el backend:', error);
        if (error.error && error.error.error) {
            alert(`Error al registrar la venta: ${error.error.error}`);
        } else {
            alert('Hubo un error al registrar la venta. Por favor, inténtalo de nuevo.');
        }
      }
    );
  }
  // --- FIN FUNCIÓN REALIZAR VENTA MODIFICADA ---



  ngOnInit(): void {
    console.log('Productos recibidos en ListaSucursales:', this.productos);
  }
}