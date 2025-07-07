import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { RegisterComponent } from './components/register/register.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { HistorialComponent } from './components/historial/historial.component';
import { PerfilComponent } from './components/perfil/perfil.component';
export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chatbot', component: ChatbotComponent },
   {path: 'inicio',component: InicioComponent},
   {path:'historial',component:HistorialComponent},
   {path:'perfil',component:PerfilComponent}
];

