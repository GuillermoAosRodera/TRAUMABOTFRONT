import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  entradaUsuario: string = '';
  mensajes: { usuario?: string; bot?: string; mensaje_usuario?: string }[] = [];  // Añadimos mensaje_usuario
  threadId: string | null = null;
  zonaDetectada: string | null = null;
  conversacionActiva: boolean = false;
  cerrado: boolean = false;
  zonaSeleccionada: string | null = null;

  avatarUrl = 'assets/img/Hombre.PNG';
  avatarMenuOpen = false;
  nombreUsuario: string | null = null;

  // Temporizador
  inactivityTimeout: any;  // Variable para guardar el temporizador

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<any>('http://localhost:8000/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: res => this.nombreUsuario = res.nombre || 'Usuario',
        error: err => console.error('Error cargando nombre:', err)
      });
    }
  }

  // Método para reiniciar el temporizador de inactividad
  resetInactivityTimer() {
    // Si ya existe un temporizador, lo limpiamos
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    // Establecemos un nuevo temporizador que cerrará el hilo después de 1 minuto sin actividad
    this.inactivityTimeout = setTimeout(() => {
      this.cerrarHilo();
    }, 60000);  // 60000 ms = 1 minuto
  }

  // Función para hacer scroll hacia abajo automáticamente
  scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Enviar mensaje y reiniciar el temporizador
  enviarMensaje() {
    const mensaje = this.entradaUsuario.trim();
    if (!mensaje) return;

    // Guardar el mensaje del usuario y asegurarse de tener mensaje_usuario
    this.mensajes.push({ usuario: mensaje, mensaje_usuario: mensaje });
    this.entradaUsuario = '';
    this.mensajes.push({ bot: '...' });

    this.scrollToBottom();
    // Reiniciar el temporizador de inactividad
    this.resetInactivityTimer();

    this.llamarAsistenteEspecifico(mensaje);
  }
  llamarAsistenteEspecifico(mensaje: string) {
  const zona = this.zonaDetectada?.trim().toLowerCase();
  console.log('Zona detectada:', zona);

  let ruta: string | null = null;

  if (zona === 'rodilla') {
    ruta = 'http://localhost:8000/api/asistente-rodilla';
  } else if (zona === 'tobillo') {
    ruta = 'http://localhost:8000/api/asistente-tobillo';
  } else if (zona === 'hombro') {
    ruta = 'http://localhost:8000/api/asistente-hombro';
  } else if (zona === 'codo') {
    ruta = 'http://localhost:8000/api/asistente-codo';
  }else if (zona === 'muñeca') {
    ruta = 'http://localhost:8000/api/asistente-muneca';
  }else if (zona === 'cuello') {
    ruta = 'http://localhost:8000/api/asistente-cuello';
  }

  console.log('Ruta generada:', ruta);
  console.log('Mensaje enviado:', mensaje);

  // Validar thread_id
  if (!this.threadId) {
    const clave = `thread_id_${zona}`;
    const guardado = localStorage.getItem(clave);

    if (guardado && guardado.startsWith('thread_')) {
      this.threadId = guardado;
    } else {
      localStorage.removeItem(clave);
      this.threadId = null;
    }
  }

  console.log('Thread ID:', this.threadId);

  if (!ruta) {
    this.reemplazarUltimoBot('No se reconoce la zona indicada.');
    return;
  }

  const body: any = { message: mensaje, user_id: this.getUserId() };  // Añadir user_id
  if (this.threadId) body.thread_id = this.threadId;

  this.http.post<{ respuesta: string; thread_id: string; diagnostico?: any; cerrado?: boolean }>(ruta, body).subscribe({
    next: (res) => {
      this.threadId = res.thread_id;
      if (this.threadId?.startsWith('thread_')) {
        localStorage.setItem(`thread_id_${zona}`, this.threadId);
      }
      this.reemplazarUltimoBot(res.respuesta);

      if (res.diagnostico) {
        const ficha = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p><strong>Sospecha:</strong> <span style="color: #2c3e50;">${res.diagnostico.lesion}</span></p>
          
          <hr style="border-top: 1px solid #ccc; margin: 10px 0;">
          
          <p><strong>Zona afectada:</strong> <span style="color: #2c3e50;">${res.diagnostico.zona_afectada}</span></p>
          
          <p><strong>Tipo de dolor:</strong> <span style="color: #e74c3c;">${res.diagnostico.tipo_dolor}</span></p>
          
          <hr style="border-top: 1px solid #ccc; margin: 10px 0;">
          
          <p><strong>Causas:</strong> <span style="color: #8e44ad;">${res.diagnostico.causas}</span></p>
          
          <p><strong>Imagen diagnóstica:</strong> <span style="color: #8e44ad;">${res.diagnostico.imagen_diagnostica}</span></p>
          
          <p><strong>Recomendación:</strong> <span style="color: #27ae60;">${res.diagnostico.tratamiento}</span></p>

          <hr style="border-top: 1px solid #ccc; margin: 10px 0;">

          <p><strong>Cirugía recomendada:</strong> 
            <span style="color: #2980b9;">
              ${res.diagnostico.cirugia_recomendada ? 'Sí' : 'No'}
            </span>
          </p>
          
          <p style="font-style: italic; color: #7f8c8d;">(Recuerda que esto no sustituye una valoración médica)</p>
        </div>
        `.trim();

        // Usar innerHTML para que se pueda mostrar con formato
        this.mensajes.push({ bot: ficha });
      }

      if (res.cerrado) {
        this.cerrado = true;
      }
    },
    error: (err) => {
      console.error('Error llamando al backend:', err);
      this.reemplazarUltimoBot('Error al contactar con el asistente específico.');
    }
  });
}


  reemplazarUltimoBot(respuesta: string) {
    const index = this.mensajes.findIndex((m) => m.bot === '...');
    if (index !== -1) this.mensajes[index].bot = respuesta;
  }

  seleccionarZona(zona: any) {
    const zonaNormalizada = zona.nombre.trim().toLowerCase();

    this.zonaSeleccionada = zona.nombre;
    this.zonaDetectada = zonaNormalizada;
    this.entradaUsuario = '';
    this.mensajes = [];
    this.conversacionActiva = true;
    this.threadId = null;
    this.cerrado = false;

    // Reiniciar el temporizador cuando se selecciona una zona
    this.resetInactivityTimer();
  }

  zonas = [
    { nombre: 'Rodilla' },
    { nombre: 'Tobillo' },
    { nombre: 'Hombro' },
    { nombre: 'Codo' },
    { nombre: 'Muñeca' },
    { nombre: 'Cuello' }
  ];

  mostrarChat(zona: string) {
    this.zonaSeleccionada = zona;
    this.mensajes = [];
  }

  nuevoCaso(): void {
    const url = 'http://localhost:8000/api/nuevo-thread';

    this.http.post<any>(url, { zona: this.zonaSeleccionada }).subscribe(
      res => {
        this.threadId = res.thread_id;
        if (this.threadId?.startsWith('thread_')) {
          localStorage.setItem(`thread_id_${this.zonaDetectada}`, this.threadId);
        }
        this.mensajes = [];
        this.entradaUsuario = '';
        this.cerrado = false;
      },
      _ => {
        this.mensajes.push({
          bot: 'No se pudo crear un nuevo caso. Intenta de nuevo más tarde.'
        });
      }
    );
  }

  cerrarHilo() {
    this.cerrado = true;
    this.mensajes.push({ bot: 'Este hilo ha sido cerrado automáticamente por inactividad.' });

    // Opcional: Llamar al backend para cerrar el hilo, si es necesario.
    if (this.threadId) {
      this.http.post('http://localhost:8000/api/cerrar-hilo', { thread_id: this.threadId }).subscribe();
    }
  }

  // Método para obtener el user_id (suponiendo que lo tienes almacenado en localStorage o en un servicio)
  getUserId() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      // Si no existe, deberías manejar este caso de alguna manera, tal vez redirigiendo al login
      console.error('User ID no encontrado');
    }
    return userId;
  }
}
