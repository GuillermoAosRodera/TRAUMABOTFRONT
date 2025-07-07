import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Obtener el token JWT desde el almacenamiento local
  getToken(): string | null {
    return localStorage.getItem('token');  // Asegúrate de que guardes el token en el almacenamiento local al hacer login
  }

  // Guardar el token en el almacenamiento local
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Eliminar el token (para logout)
  removeToken(): void {
    localStorage.removeItem('token');
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();  // Devuelve true si el token está presente, lo que significa que el usuario está autenticado
  }
}
