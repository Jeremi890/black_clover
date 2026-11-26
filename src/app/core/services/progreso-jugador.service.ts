import { Injectable, signal, computed, effect } from '@angular/core';
import { ProgresoPersonaje } from '../models/personaje.model';

const STORAGE_KEY = 'black_clover_progreso_jugador_v1';

@Injectable({
  providedIn: 'root'
})
export class ProgresoJugadorService {
  private readonly _progreso = signal<Record<string, ProgresoPersonaje>>({});
  readonly progreso = this._progreso.asReadonly();

  readonly estrellasTotales = computed(() => {
    const p = this._progreso();
    return Object.values(p).reduce((sum, item) => sum + (item.estrellas || 0), 100); // 100 estrellas base
  });

  constructor() {
    this.cargarDesdeStorage();

    // Auto-persistencia en localStorage con Signals effect()
    effect(() => {
      const data = this._progreso();
      if (typeof localStorage !== 'undefined' && Object.keys(data).length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.warn('Error guardando en localStorage:', e);
        }
      }
    });
  }

  private cargarDesdeStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this._progreso.set(JSON.parse(raw));
      } else {
        const inicial: Record<string, ProgresoPersonaje> = {
          asta: {
            estrellas: 100,
            mejorDistanciaMetros: 0,
            hechizosDesbloqueados: ['asta-danma'],
            misionesCompletadas: []
          },
          yuno: {
            estrellas: 100,
            mejorDistanciaMetros: 0,
            hechizosDesbloqueados: ['yuno-torre'],
            misionesCompletadas: []
          },
          noelle: {
            estrellas: 100,
            mejorDistanciaMetros: 0,
            hechizosDesbloqueados: ['noelle-nido'],
            misionesCompletadas: []
          },
          yami: {
            estrellas: 100,
            mejorDistanciaMetros: 0,
            hechizosDesbloqueados: ['yami-corte'],
            misionesCompletadas: []
          }
        };
        this._progreso.set(inicial);
      }
    } catch (e) {
      console.warn('Error cargando progreso inicial:', e);
    }
  }

  obtenerProgresoPersonaje(personajeId: string): ProgresoPersonaje {
    const p = this._progreso()[personajeId];
    if (p) return p;
    return {
      estrellas: 50,
      mejorDistanciaMetros: 0,
      hechizosDesbloqueados: [],
      misionesCompletadas: []
    };
  }

  estaDesbloqueado(personajeId: string, hechizoId: string, costo: number = 0): boolean {
    if (costo === 0) return true;
    const prog = this.obtenerProgresoPersonaje(personajeId);
    return prog.hechizosDesbloqueados.includes(hechizoId);
  }

  desbloquearHechizo(personajeId: string, hechizoId: string, costo: number): boolean {
    const prog = this.obtenerProgresoPersonaje(personajeId);
    if (prog.hechizosDesbloqueados.includes(hechizoId)) return true;
    if (prog.estrellas < costo) return false;

    this._progreso.update(current => {
      const p = current[personajeId] || {
        estrellas: 0,
        mejorDistanciaMetros: 0,
        hechizosDesbloqueados: [],
        misionesCompletadas: []
      };

      return {
        ...current,
        [personajeId]: {
          ...p,
          estrellas: p.estrellas - costo,
          hechizosDesbloqueados: [...p.hechizosDesbloqueados, hechizoId]
        }
      };
    });
    return true;
  }

  sumarEstrellas(personajeId: string, cantidad: number) {
    this._progreso.update(current => {
      const p = current[personajeId] || {
        estrellas: 0,
        mejorDistanciaMetros: 0,
        hechizosDesbloqueados: [],
        misionesCompletadas: []
      };
      return {
        ...current,
        [personajeId]: {
          ...p,
          estrellas: p.estrellas + cantidad
        }
      };
    });
  }

  registrarDistancia(personajeId: string, metros: number) {
    this._progreso.update(current => {
      const p = current[personajeId] || {
        estrellas: 0,
        mejorDistanciaMetros: 0,
        hechizosDesbloqueados: [],
        misionesCompletadas: []
      };
      return {
        ...current,
        [personajeId]: {
          ...p,
          mejorDistanciaMetros: Math.max(p.mejorDistanciaMetros, metros)
        }
      };
    });
  }
}
