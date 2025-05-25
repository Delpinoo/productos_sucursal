import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService implements OnDestroy {
  private eventSource: EventSource | undefined;
  private stockAgotadoSubject = new Subject<any>();
  public stockAgotado$: Observable<any> = this.stockAgotadoSubject.asObservable();

  constructor(private ngZone: NgZone) { }

  /**
   * Establece la conexión con el endpoint SSE del backend.
   * @param url La URL del endpoint SSE (ej. 'http://localhost:5000/events')
   */
  connect(url: string): void {
    if (typeof EventSource !== 'undefined') {
      // Si ya hay una conexión, la cerramos antes de crear una nueva
      if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource(url);

      // Escuchar el evento 'message' (el evento por defecto para SSE)
      this.eventSource.onmessage = (event: MessageEvent) => {
        this.ngZone.run(() => { // Ejecutar dentro de la zona de Angular para asegurar la detección de cambios
          try {
            const data = JSON.parse(event.data);
            console.log('Evento SSE recibido:', data);
            // Si el evento es de tipo 'stock_agotado', emitirlo a los suscriptores
            if (data.type === 'stock_agotado') {
              this.stockAgotadoSubject.next(data);
            }
          } catch (e) {
            console.error('Error al parsear el mensaje SSE:', e, event.data);
          }
        });
      };

      // Manejar errores de conexión
      this.eventSource.onerror = (error: Event) => {
        this.ngZone.run(() => {
          console.error('Error en la conexión SSE:', error);
          // Puedes intentar reconectar aquí o mostrar un mensaje al usuario
          // Para simplificar, solo desconectamos si hay un error persistente
          this.disconnect();
        });
      };

      // Manejar la apertura de la conexión (opcional)
      this.eventSource.onopen = () => {
        this.ngZone.run(() => {
          console.log('Conexión SSE establecida.');
        });
      };

    } else {
      console.warn('EventSource no es soportado por este navegador.');
    }
  }

  /**
   * Cierra la conexión SSE.
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
      console.log('Conexión SSE cerrada.');
    }
  }

  // Asegurarse de cerrar la conexión cuando el servicio se destruye
  ngOnDestroy(): void {
    this.disconnect();
  }
}