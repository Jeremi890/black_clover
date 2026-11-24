import { Routes } from '@angular/router';
import { minijuegoGuard } from './core/guards/minijuego.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/inicio/inicio.component').then(m => m.InicioComponent),
    title: 'Black Clover • Inicio • Grimorio 3D'
  },
  {
    path: 'personajes',
    loadComponent: () => import('./features/personajes/galeria-personajes.component').then(m => m.GaleriaPersonajesComponent),
    title: 'Black Clover • Grimorios de Magos'
  },
  {
    path: 'personajes/:id',
    loadComponent: () => import('./features/personajes/galeria-personajes.component').then(m => m.GaleriaPersonajesComponent),
    title: 'Black Clover • Grimorio'
  },
  {
    path: 'reinos',
    loadComponent: () => import('./features/reinos/mapa-reinos.component').then(m => m.MapaReinosComponent),
    title: 'Black Clover • Mapa de los 4 Reinos'
  },
  {
    path: 'reinos/:slug',
    loadComponent: () => import('./features/reinos/vista-reino.component').then(m => m.VistaReinoComponent),
    title: 'Black Clover • Crónica del Reino'
  },
  {
    path: 'misiones/:personajeId',
    loadComponent: () => import('./features/minijuego/minijuego-shell.component').then(m => m.MinijuegoShellComponent),
    canMatch: [minijuegoGuard],
    title: 'Black Clover • Misión Runner'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
