import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    user: '',  // Campo para email o nombre de usuario
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    if (!this.loginData.user || !this.loginData.password) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    // Verificar si el usuario ingresó un email o nombre de usuario
    const credentials = this.loginData.user.includes('@')
      ? { email: this.loginData.user, password: this.loginData.password }
      : { usuario: this.loginData.user, password: this.loginData.password };

    // Enviar las credenciales al backend para autenticación
    this.http.post<any>('http://localhost:8000/api/login', credentials)
      .subscribe({
        next: res => {
          // Guardar el token y user_id en el almacenamiento local
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user_id', res.user_id);
          // Redirigir al usuario a la página del chatbot
          this.router.navigate(['/chatbot']);
        },
        error: err => {
          console.error(err);
          alert('Credenciales incorrectas. Intenta de nuevo.');
        }
      });
  }

  goToRegister() {
    // Redirigir a la página de registro
    this.router.navigate(['/register']);
  }
}
