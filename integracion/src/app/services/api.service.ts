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

  registrarVenta(idSucursal: number, productos: { id_producto: number; cantidad: number }[]): Observable<any> {
    const formData = new FormData();
    formData.append('id_sucursal', idSucursal.toString());

    // Flask espera 'productos[0][id_producto]', 'productos[0][cantidad]', etc.
    productos.forEach((item, index) => {
      formData.append(`productos[${index}][id_producto]`, item.id_producto.toString());
      formData.append(`productos[${index}][cantidad]`, item.cantidad.toString());
    });

    console.log('API_SERVICE: Enviando FormData:', formData); // Debugging: revisa en la consola del navegador

    // Importante: No establecer el 'Content-Type' a 'application/x-www-form-urlencoded'
    // cuando se usa FormData. HttpClient lo hace automáticamente con el boundary correcto.
    return this.http.post<any>(`${this.apiUrl}/venta`, formData);
  }
}