import { Injectable, inject, signal, effect, computed } from '@angular/core';
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
  private readonly grimorioState = inject(GrimorioStateService);

  private readonly _temaManual = signal<PerfilAnimacion | null>(null);

  // Computed reactivo puro derivado de la entidad activa o previsualización manual en hover
  readonly temaActual = computed<PerfilAnimacion>(() => {
    const manual = this._temaManual();
    if (manual) return manual;
    const entidad = this.grimorioState.entidadActiva();
    if (entidad && entidad.perfilVisual) {
      return entidad.perfilVisual;
    }
    return TEMA_DEFAULT;
  });

  constructor() {
    // Inyección reactiva de variables CSS en documentElement
    effect(() => {
      const tema = this.temaActual();
      this.aplicarVariablesCss(tema);
    });
  }

  setTemaManual(perfil: PerfilAnimacion) {
    this._temaManual.set(perfil);
  }

  resetTemaManual() {
    this._temaManual.set(null);
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
