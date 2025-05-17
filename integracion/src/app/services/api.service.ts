import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoConStock } from '../interface/producto-con-stock';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }

  buscarProductos(termino: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar-productos?query=${termino}`);
  }

    buscarProductosConStock(termino: string): Observable<ProductoConStock[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<ProductoConStock[]>(`${this.apiUrl}/productos/stock`, { params });
  }

}