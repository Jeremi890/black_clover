import { Injectable, signal, computed } from '@angular/core';
import { Personaje } from '../models/personaje.model';
import { Reino } from '../models/reino.model';

export type EntidadGrimorio = Personaje | Reino;
export type TipoEntidad = 'personaje' | 'reino';

@Injectable({
  providedIn: 'root'
})
export class GrimorioStateService {
  // Signals privados editables internamente
  private readonly _entidadActiva = signal<EntidadGrimorio | null>(null);
  private readonly _tipoEntidad = signal<TipoEntidad | null>(null);
  private readonly _estaAbierto = signal<boolean>(false);
  private readonly _paginaActual = signal<number>(0); // 0: Portada/Bio, 1..N: Hechizos o Escenarios
  private readonly _estaAnimando = signal<boolean>(false);

  // Signals públicos de solo lectura (asReadonly)
  readonly entidadActiva = this._entidadActiva.asReadonly();
  readonly tipoEntidad = this._tipoEntidad.asReadonly();
  readonly estaAbierto = this._estaAbierto.asReadonly();
  readonly paginaActual = this._paginaActual.asReadonly();
  readonly estaAnimando = this._estaAnimando.asReadonly();

  // Computeds auxiliares
  readonly totalPaginas = computed(() => {
    const entidad = this._entidadActiva();
    if (!entidad) return 0;
    if (this._tipoEntidad() === 'personaje') {
      const p = entidad as Personaje;
      return 1 + (p.hechizos?.length || 0);
    } else {
      const r = entidad as Reino;
      return 1 + (r.escenarios?.length || 0);
    }
  });

  readonly personajeActivo = computed<Personaje | null>(() => {
    return this._tipoEntidad() === 'personaje' ? (this._entidadActiva() as Personaje) : null;
  });

  readonly reinoActivo = computed<Reino | null>(() => {
    return this._tipoEntidad() === 'reino' ? (this._entidadActiva() as Reino) : null;
  });

  abrirPersonaje(personaje: Personaje, pagina: number = 0) {
    this._entidadActiva.set(personaje);
    this._tipoEntidad.set('personaje');
    this._paginaActual.set(Math.max(0, pagina));
    this._estaAbierto.set(true);
  }

  abrirReino(reino: Reino, pagina: number = 0) {
    this._entidadActiva.set(reino);
    this._tipoEntidad.set('reino');
    this._paginaActual.set(Math.max(0, pagina));
    this._estaAbierto.set(true);
  }

  cerrar() {
    this._estaAbierto.set(false);
    this._estaAnimando.set(false);
    setTimeout(() => {
      if (!this._estaAbierto()) {
        this._entidadActiva.set(null);
        this._tipoEntidad.set(null);
        this._paginaActual.set(0);
      }
    }, 350);
  }

  /**
   * Actualización forzada del folio sin bloquearse por estaAnimando.
   * Utilizado internamente por el timeline de GSAP en el midpoint (-90deg) y onComplete.
   */
  forzarPagina(pagina: number) {
    const max = this.totalPaginas() - 1;
    if (pagina >= 0 && pagina <= max) {
      this._paginaActual.set(pagina);
    }
  }

  /**
   * Navegación solicitada por el usuario (bloqueada si estaAnimando() es true)
   */
  irAPagina(pagina: number, ignorarBloqueo: boolean = false): boolean {
    if (!ignorarBloqueo && this._estaAnimando()) return false;
    const max = this.totalPaginas() - 1;
    if (pagina < 0 || pagina > max || pagina === this._paginaActual()) return false;
    this._paginaActual.set(pagina);
    return true;
  }

  paginaSiguiente(): boolean {
    if (this._estaAnimando()) return false;
    const max = this.totalPaginas() - 1;
    if (this._paginaActual() < max) {
      this._paginaActual.update(p => p + 1);
      return true;
    }
    return false;
  }

  paginaAnterior(): boolean {
    if (this._estaAnimando()) return false;
    if (this._paginaActual() > 0) {
      this._paginaActual.update(p => p - 1);
      return true;
    }
    return false;
  }

  setAnimando(val: boolean) {
    this._estaAnimando.set(val);
  }
}
