import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos el nuevo servicio gRPC
import { ProductosGrpcService, ProductoAsObject } from '../../grpc/productos-grpc.service';
// Importamos el tipo Producto generado por Protobuf
// Ya no necesitamos importar Producto directamente de productos_pb si trabajamos con AsObject
// import { Producto } from '../../grpc/productos_pb'; 

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-producto.component.html',
  styleUrls: ['./lista-producto.component.css'],
  imports: [CommonModule],
})
export class ListaProductosComponent implements OnInit {
  // Cambiamos el tipo de productos a ProductoAsObject[]
  productos: ProductoAsObject[] = []; 

  // Inyectamos el servicio gRPC en lugar de ApiService
  constructor(private productosGrpcService: ProductosGrpcService) {} 

  ngOnInit(): void {
    // Llamamos al método listProductos() de nuestro servicio gRPC
    this.productosGrpcService.listProductos().subscribe(
      (data: ProductoAsObject[]) => { // Esperamos ProductoAsObject[]
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