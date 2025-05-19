import { Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-buscador',
  standalone: true,
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent {
  @Output() terminoBusqueda = new EventEmitter<string>();
  terminoBusquedaControl = new Subject<string>();

  constructor() {
    this.terminoBusquedaControl.pipe(
      debounceTime(300),
      distinctUntilChanged() 
    ).subscribe(termino => {
      this.terminoBusqueda.emit(termino);
    });
  }

  buscar(termino: string): void {
    this.terminoBusquedaControl.next(termino);
  }
}