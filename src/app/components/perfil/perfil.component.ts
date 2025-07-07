import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../authservice'; // Asegúrate de importar el servicio

// Importar los módulos necesarios
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Declarar los módulos necesarios
  templateUrl: './perfil.component.html',
})
export class PerfilComponent {
  perfilForm: FormGroup;

  // Inyectar las dependencias (se hace así en un componente standalone)
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    // Inicializa el formulario con los campos necesarios
    this.perfilForm = this.fb.group({
      current_password: ['', [Validators.required]],  // Contraseña actual
      new_username: ['', [Validators.minLength(3)]],  // Nuevo nombre de usuario
      new_password: ['', [Validators.minLength(6)]],  // Nueva contraseña
      new_password_confirmation: ['', [Validators.minLength(6)]],  // Confirmación de nueva contraseña
    });
  }

  // Método para actualizar el perfil
  updatePerfil() {
    if (this.perfilForm.invalid) {
      return;
    }

    const formData = this.perfilForm.value;

    // Obtener el token JWT desde el AuthService
    const token = this.authService.getToken();
    
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    // Configurar los encabezados de la solicitud con el token JWT
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    // Hacer la solicitud PUT al backend para actualizar el perfil
    this.http.put('/api/update-profile', formData, { headers }).subscribe(
      (response) => {
        alert('Perfil actualizado correctamente');
      },
      (error) => {
        alert('Error: ' + error.error.message);
      }
    );
  }
}
