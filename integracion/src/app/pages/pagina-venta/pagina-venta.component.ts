import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service'; 
import { BuscadorComponent } from '../buscador/buscador.component';
import { DetalleProductoComponent } from '../detalle-producto/detalle-producto.component';
import { FormularioVentaComponent } from '../formulario-venta/formulario-venta.component';
import { ListaSucursalesComponent } from '../lista-sucursales/lista-sucursales.component';
import { ProductoConStock } from '../../interface/producto-con-stock';

@Component({
  selector: 'app-pagina-venta',
  standalone: true,
  imports: [ListaSucursalesComponent,DetalleProductoComponent, FormularioVentaComponent, BuscadorComponent],
  templateUrl: './pagina-venta.component.html',
  styleUrls: ['./pagina-venta.component.css']
})
export class PaginaVentaComponent {

  productosFiltrados: ProductoConStock[] = []; 
  productoSeleccionado: any;
  sucursalSeleccionada: any;
  
  constructor(private apiService: ApiService) { }

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