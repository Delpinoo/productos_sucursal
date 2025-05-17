import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common'; // ¡Importa NgFor!

interface ProductoParaLista {
  id: number;
  nombre: string;
  descripcion?: string;
  stockPorSucursal: {
    idSucursal: number;
    nombreSucursal: string;
    cantidad: number;
    precio: number;
  }[];
}

@Component({
  selector: 'app-lista-sucursales',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './lista-sucursales.component.html',
  styleUrls: ['./lista-sucursales.component.css']
})
export class ListaSucursalesComponent implements OnInit {
  @Input() productos: any[] = []; // ¡Esta es la propiedad para recibir los productos!

  constructor() { }

  ngOnInit(): void {
    console.log('Productos recibidos en ListaSucursales:', this.productos);
    // Ahora usa 'this.productos' en el template
  }

  // ...
}