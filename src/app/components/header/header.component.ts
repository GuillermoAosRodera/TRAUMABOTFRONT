import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  avatarUrl: string = 'assets/img/Hombre.PNG';
  avatarMenuOpen: boolean = false;
  nombreUsuario: string | null = null;
  isLoggedIn: boolean = false; 
  settingsMenuOpen: boolean = false; // Para el menú de configuración

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      this.avatarUrl = savedAvatar;
    }

    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<any>('http://localhost:8000/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: res => {
          this.nombreUsuario = res.nombre?.toUpperCase() || 'USUARIO';
          this.isLoggedIn = true; 
        },
        error: err => {
          console.error('Error al obtener usuario:', err);
          this.isLoggedIn = false;
        }
      });
    }
  }

  toggleAvatarMenu(): void {
    this.avatarMenuOpen = !this.avatarMenuOpen;
  }

  toggleSettingsMenu(): void {
    this.settingsMenuOpen = !this.settingsMenuOpen; // Cambia el estado del menú de configuración
  }

  setAvatar(gender: 'male' | 'female'): void {
    this.avatarUrl = gender === 'male'
      ? 'assets/img/Hombre.PNG'
      : 'assets/img/Mujer.PNG';
    localStorage.setItem('userAvatar', this.avatarUrl);
    this.avatarMenuOpen = false;
  }

  irAConfiguracion(): void {
    this.router.navigate(['/perfil']);
  }
  
  irAInicio(): void {
    this.router.navigate(['/inicio']);
  }

  goToProfile(): void {
    this.router.navigate(['/perfil']);
    this.settingsMenuOpen = false; // Cierra el menú
  }

  goToHistorial(): void {
    this.router.navigate(['/historial']);
    this.settingsMenuOpen = false; // Cierra el menú
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/inicio']);
    this.settingsMenuOpen = false; // Cierra el menú
  }
}
