import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-producto.component.html',
  styleUrls: ['./lista-producto.component.css'],
  imports: [CommonModule],
})
export class ListaProductosComponent implements OnInit {
  productos: any[] = []; 

  constructor(private apiService: ApiService) {} 

  ngOnInit(): void {
    this.apiService.getProductos().subscribe(
      (data) => {
        this.productos = data; 
        console.log('Productos recibidos:', data); 
        console.log('this.productos después de la asignación:', this.productos);
      },
      (error) => {
        console.error('Error al obtener productos:', error); 
      }
    );
  }
}
