import { Component, OnInit, OnDestroy } from '@angular/core'; // Añadido OnInit y OnDestroy
import { ApiService } from '../../services/api.service';
import { BuscadorComponent } from '../buscador/buscador.component';
import { DetalleProductoComponent } from '../detalle-producto/detalle-producto.component';
import { FormularioVentaComponent } from '../formulario-venta/formulario-venta.component';
import { ListaSucursalesComponent } from '../lista-sucursales/lista-sucursales.component';
import { ProductoConStock } from '../../interface/producto-con-stock';
import { SseService } from '../../services/sse.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-pagina-venta',
  standalone: true,
  imports: [CommonModule, ListaSucursalesComponent, DetalleProductoComponent, FormularioVentaComponent, BuscadorComponent],
  templateUrl: './pagina-venta.component.html',
  styleUrls: ['./pagina-venta.component.css']
})
export class PaginaVentaComponent implements OnInit, OnDestroy { // Implementa OnInit y OnDestroy

  productosFiltrados: ProductoConStock[] = [];
  productoSeleccionado: any;
  sucursalSeleccionada: any;
  notificationMessage: string | null = null;
  private sseSubscription: Subscription | undefined;

  constructor(private apiService: ApiService, private sseService: SseService) { }

  ngOnInit(): void {
    // Conectar al servicio SSE cuando el componente se inicializa
    const sseUrl = 'http://localhost:5000/events'; // ¡Ajusta esta URL si tu Flask corre en otro puerto/dominio!
    this.sseService.connect(sseUrl);

    // Suscribirse a los eventos de stock agotado
    this.sseSubscription = this.sseService.stockAgotado$.subscribe(
      (data: any) => {
        // Mostrar la notificación al usuario
        //alert(data.message); // Ejemplo simple con alert()
        this.notificationMessage = data.message; // Opcional: mostrar en un div en el HTML
        setTimeout(() => this.notificationMessage = null, 5000); // Ocultar después de 5 segundos
        // Aquí podrías también recargar la lista de productos para reflejar el stock agotado
        // Por ejemplo: this.cargarProductosDesdeBackend();
      },
      (error: any) => {
        console.error('Error al recibir notificación SSE:', error);
      }
    );
  }

  ngOnDestroy(): void {
    // Desconectar el servicio SSE cuando el componente se destruye para evitar fugas de memoria
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    this.sseService.disconnect(); // Llama al método del servicio
  }


  buscarProducto(termino: string): void {
    if (termino) {
      this.apiService.buscarProductosConStock(termino).subscribe(
        (resultados) => {
          this.productosFiltrados = resultados;
          console.log('Resultados de la búsqueda con stock:', resultados);
        },
        (error) => {
          console.error('Error al buscar productos con stock:', error);
          console.log('Objeto de error completo:', error);
          this.productosFiltrados = [];
        }
      );
    } else {
      this.productosFiltrados = [];
    }
  }

  mostrarDetalle(sucursal: any): void {
    this.sucursalSeleccionada = sucursal;
  }
}