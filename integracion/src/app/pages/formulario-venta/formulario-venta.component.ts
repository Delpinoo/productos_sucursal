import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-formulario-venta',
  standalone: true,
  templateUrl: './formulario-venta.component.html',
  styleUrl: './formulario-venta.component.css'
})
export class FormularioVentaComponent {
@Input() productos: any[] = [];
@Input() sucursal: any; 

}
