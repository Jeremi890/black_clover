import { Injectable, signal, computed } from '@angular/core';
import { Personaje } from '../models/personaje.model';
import { Reino } from '../models/reino.model';

export type EntidadGrimorio = Personaje | Reino;
export type TipoEntidad = 'personaje' | 'reino';

@Injectable({
  providedIn: 'root'
})
export class GrimorioStateService {
  readonly entidadActiva = signal<EntidadGrimorio | null>(null);
  readonly tipoEntidad = signal<TipoEntidad | null>(null);
  readonly estaAbierto = signal<boolean>(false);
  readonly paginaActual = signal<number>(0); // 0: Portada/Bio, 1..N: Hechizos o Escenarios
  readonly estaAnimando = signal<boolean>(false);

  // Computed total de páginas disponibles en el grimorio
  readonly totalPaginas = computed(() => {
    const entidad = this.entidadActiva();
    if (!entidad) return 0;
    if (this.tipoEntidad() === 'personaje') {
      const p = entidad as Personaje;
      return 1 + (p.hechizos?.length || 0);
    } else {
      const r = entidad as Reino;
      return 1 + (r.escenarios?.length || 0);
    }
  });

  // Helpers computados
  readonly personajeActivo = computed<Personaje | null>(() => {
    return this.tipoEntidad() === 'personaje' ? (this.entidadActiva() as Personaje) : null;
  });

  readonly reinoActivo = computed<Reino | null>(() => {
    return this.tipoEntidad() === 'reino' ? (this.entidadActiva() as Reino) : null;
  });

  abrirPersonaje(personaje: Personaje, pagina: number = 0) {
    this.entidadActiva.set(personaje);
    this.tipoEntidad.set('personaje');
    this.paginaActual.set(Math.max(0, pagina));
    this.estaAbierto.set(true);
  }

  abrirReino(reino: Reino, pagina: number = 0) {
    this.entidadActiva.set(reino);
    this.tipoEntidad.set('reino');
    this.paginaActual.set(Math.max(0, pagina));
    this.estaAbierto.set(true);
  }

  cerrar() {
    if (this.estaAnimando()) return;
    this.estaAbierto.set(false);
    // Tras cerrar limpiamos el estado tras un delay razonable
    setTimeout(() => {
      if (!this.estaAbierto()) {
        this.entidadActiva.set(null);
        this.tipoEntidad.set(null);
        this.paginaActual.set(0);
      }
    }, 400);
  }

  irAPagina(pagina: number): boolean {
    if (this.estaAnimando()) return false;
    const max = this.totalPaginas() - 1;
    if (pagina < 0 || pagina > max || pagina === this.paginaActual()) return false;
    this.paginaActual.set(pagina);
    return true;
  }

  paginaSiguiente(): boolean {
    if (this.estaAnimando()) return false;
    const max = this.totalPaginas() - 1;
    if (this.paginaActual() < max) {
      this.paginaActual.update(p => p + 1);
      return true;
    }
    return false;
  }

  paginaAnterior(): boolean {
    if (this.estaAnimando()) return false;
    if (this.paginaActual() > 0) {
      this.paginaActual.update(p => p - 1);
      return true;
    }
    return false;
  }

  setAnimando(val: boolean) {
    this.estaAnimando.set(val);
  }
}
