import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service'; // Importante: Verifica la ruta correcta a tu ApiService

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-producto.component.html',
  styleUrls: ['./lista-producto.component.css'],
  imports: [CommonModule],
})
export class ListaProductosComponent implements OnInit {
  productos: any[] = []; // Inicializa la propiedad productos como un array vacío

  constructor(private apiService: ApiService) {} // Inyecta el ApiService en el constructor

  ngOnInit(): void {
    this.apiService.getProductos().subscribe(
      (data) => {
        this.productos = data; // Asigna los datos de la API a la propiedad productos
        console.log('Productos recibidos:', data); // Para depurar: verifica los datos recibidos
        console.log('this.productos después de la asignación:', this.productos);
      },
      (error) => {
        console.error('Error al obtener productos:', error); // Maneja los errores
        // Aquí podrías mostrar un mensaje al usuario, por ejemplo.
        // this.mensajeError = 'No se pudieron cargar los productos.';
      }
    );
  }
}
