import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  nombreUsuario: string = localStorage.getItem('nombreUsuario') || 'Usuario';  // Obtener el nombre del usuario desde el localStorage
  historialConsultas: any[] = [];  // Guardará el historial de consultas
  consultaSeleccionada: any = null;  // Contendrá la consulta seleccionada
  mensajes: { usuario: string, asistente: string }[] = [];  // Mensajes de la conversación

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Al cargar el componente, obtenemos el historial
    this.obtenerHistorial();
  }

  obtenerHistorial(): void {
    const token = localStorage.getItem('token');
    if (token) {
      // Recuperamos el historial de consultas
      this.http.get<any[]>('http://localhost:8000/api/historial', {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res) => {
          // Filtramos para solo obtener consultas cerradas
          this.historialConsultas = res.filter(c => c.cerrado === true || c.cerrado === 1);
        },
        error: (err) => {
          console.error('Error al obtener historial:', err);
          // Agregar algún tipo de notificación o mensaje de error si lo deseas
        }
      });
    } else {
      console.error('No se encontró el token de autenticación.');
      // Redirigir al login si no se encuentra el token
      this.router.navigate(['/login']);
    }
  }

  seleccionarConsulta(consulta: any): void {
    const token = localStorage.getItem('token');
    if (token) {
      // Recuperamos la conversación asociada al `thread_id` de la consulta seleccionada
      this.http.get<any>(`http://localhost:8000/api/conversacion/${consulta.thread_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res) => {
          this.consultaSeleccionada = res;  // Asignamos los detalles de la consulta
          // Mapear los mensajes a un formato adecuado para el frontend
          this.mensajes = res.mensajes.map((mensaje: any) => {
            return {
              usuario: mensaje.mensaje_usuario,   // Usamos mensaje_usuario
              asistente: mensaje.respuesta_asistente  // Usamos respuesta_asistente
            };
          }) || [];  // Asignamos los mensajes si existen
        },
        error: (err) => {
          console.error('Error al obtener la conversación:', err);
          // Agregar algún tipo de notificación o mensaje de error si lo deseas
        }
      });
    } else {
      console.error('No se encontró el token de autenticación.');
      // Redirigir a la página de login si no hay token
      this.router.navigate(['/login']);
    }
  }
}
