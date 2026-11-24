import { Injectable, inject, signal, effect } from '@angular/core';
import { GrimorioStateService } from './grimorio-state.service';
import { PerfilAnimacion } from '../models/personaje.model';

export const TEMA_DEFAULT: PerfilAnimacion = {
  colorPrimario: '#e11d48',
  colorBrillo: '#fb7185',
  ease: 'power3.out',
  efectoEspecial: 'float'
};

@Injectable({
  providedIn: 'root'
})
export class TemaMagicoService {
  private grimorioState = inject(GrimorioStateService);

  readonly temaActual = signal<PerfilAnimacion>(TEMA_DEFAULT);

  constructor() {
    // Reacciona en tiempo real al cambio de entidad activa en el grimorio
    effect(() => {
      const entidad = this.grimorioState.entidadActiva();
      if (entidad && entidad.perfilVisual) {
        this.temaActual.set(entidad.perfilVisual);
        this.aplicarVariablesCss(entidad.perfilVisual);
      } else {
        this.temaActual.set(TEMA_DEFAULT);
        this.aplicarVariablesCss(TEMA_DEFAULT);
      }
    });
  }

  setTemaManual(perfil: PerfilAnimacion) {
    this.temaActual.set(perfil);
    this.aplicarVariablesCss(perfil);
  }

  private aplicarVariablesCss(perfil: PerfilAnimacion) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--color-primario', perfil.colorPrimario);
    root.style.setProperty('--color-brillo', perfil.colorBrillo);
    root.style.setProperty('--aura-glow', `${perfil.colorPrimario}55`);
    root.style.setProperty('--border-magic', `${perfil.colorBrillo}44`);
  }
}
