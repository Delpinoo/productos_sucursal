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

  constructor(private http: HttpClient) { }

  seleccionarSucursal(productoId: number, event: any): void {
    this.sucursalSeleccionada[productoId] = parseInt(event.target.value, 10);
    console.log(`Sucursal seleccionada para el producto ${productoId}:`, this.sucursalSeleccionada[productoId]);
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

  // *** NUEVO MÉTODO AQUI ***
  realizarVenta(producto: ProductoConStock): void {
    // Este método no hará nada por ahora.
    console.log(`Botón Venta clickeado para el producto ${producto.nombre}`);
    // Aquí irá la lógica futura para procesar la venta.
  }


  ngOnInit(): void {
    console.log('Productos recibidos en ListaSucursales:', this.productos);
  }
}