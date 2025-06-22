import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos el nuevo servicio gRPC
import { ProductosGrpcService } from '../../grpc/productos-grpc.service';
// Importamos el tipo Producto generado por Protobuf
import { Producto } from '../../grpc/productos_pb'; // Asegúrate de que esta ruta sea correcta

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-producto.component.html',
  styleUrls: ['./lista-producto.component.css'],
  imports: [CommonModule],
})
export class ListaProductosComponent implements OnInit {
  // Cambiamos el tipo de productos a Producto[] (el tipo de Protobuf)
  productos: Producto[] = []; 

  // Inyectamos el servicio gRPC en lugar de ApiService
  constructor(private productosGrpcService: ProductosGrpcService) {} 

  ngOnInit(): void {
    // Llamamos al método listProductos() de nuestro servicio gRPC
    this.productosGrpcService.listProductos().subscribe(
      (data: Producto[]) => { // La data ya es de tipo Producto[] directamente
        this.productos = data; 
        console.log('Productos recibidos (gRPC):', data); 
        console.log('this.productos después de la asignación (gRPC):', this.productos);
      },
      (error) => {
        console.error('Error al obtener productos (gRPC):', error); 
      }
    );
  }
}
