import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    usuario: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    fecha_nacimiento: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    this.http.post<any>('http://localhost:8000/api/register', this.registerData)
      .subscribe({
        next: res => {
          alert('Registro exitoso');
          this.router.navigate(['/login']);
        },
        error: err => {
          console.error(err);
          alert('Error al registrarse. Verifica los datos.');
        }
      });
  }
}
