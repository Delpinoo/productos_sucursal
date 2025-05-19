import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ProductoConStock } from '../../interface/producto-con-stock';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';


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


  constructor(private http: HttpClient) { }

  seleccionarSucursal(productoId: number, event: any): void {
    this.sucursalSeleccionada[productoId] = parseInt(event.target.value, 10);
    console.log(`Sucursal seleccionada para el producto ${productoId}:`, this.sucursalSeleccionada[productoId]);
  }

  actualizarCantidadAComprar(productoId: number, event: any): void {
    this.cantidadAComprar[productoId] = parseInt(event.target.value, 10) || 1;
    this.precioEnCLP[productoId] = 0; // Asigna null // Asigna null

  }

  calcularPrecioCLP(producto: ProductoConStock): void {
    const sucursalId = this.sucursalSeleccionada[producto.id];
    const cantidad = this.cantidadAComprar[producto.id];

    if (sucursalId && cantidad > 0) {
      const precioUSD = producto.stockPorSucursal.find(stock => stock.idSucursal === sucursalId)?.precio;

      if (precioUSD !== undefined) {
        const apiKey = '0fb1bdc55aa4225aceae3b5a'; // ¡Asegúrate de usar tu API key real!
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

   realizarVenta(producto: ProductoConStock): void {
    const sucursalId = this.sucursalSeleccionada[producto.id];
    const cantidadAComprar = this.cantidadAComprar[producto.id];

    if (sucursalId && cantidadAComprar > 0) {
      const sucursalIndex = producto.stockPorSucursal.findIndex(
        (stock) => stock.idSucursal === sucursalId
      );

      if (sucursalIndex !== -1) {
        const stockDisponible = producto.stockPorSucursal[sucursalIndex].cantidad;

        if (stockDisponible === 0) {
          alert(`El stock de ${producto.nombre} en ${producto.stockPorSucursal[sucursalIndex].nombreSucursal} está agotado.`);
          return; // Detener el proceso de venta
        }

        if (cantidadAComprar <= stockDisponible) {
          // Descontar el stock (simulación en el frontend)
          producto.stockPorSucursal[sucursalIndex].cantidad -= cantidadAComprar;
          alert(`Venta exitosa de ${cantidadAComprar} unidades de ${producto.nombre} en ${producto.stockPorSucursal[sucursalIndex].nombreSucursal}.`);
          // Llamada al backend para registrar la venta (tu lógica aquí)
          this.resetearEstadoVenta(producto.id);
        } else {
          alert(
            `No hay suficiente stock de ${producto.nombre} en ${producto.stockPorSucursal[sucursalIndex].nombreSucursal}. Stock disponible: ${stockDisponible}`
          );
        }
      } else {
        alert('No se encontró la información de la sucursal seleccionada.');
      }
    } else {
      alert('Por favor, selecciona una sucursal e ingresa una cantidad válida.');
    }
  }


  ngOnInit(): void {
    console.log('Productos recibidos en ListaSucursales:', this.productos);
  }
}