import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common'; // ¡Importa NgFor!

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