import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Personaje } from '../models/personaje.model';
import { Reino } from '../models/reino.model';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatosCloverService {
  private http = inject(HttpClient);

  // Carga reactiva de JSONs locales vía toSignal (cero BehaviorSubject)
  readonly personajes = toSignal(
    this.http.get<Personaje[]>('data/personajes.json').pipe(
      catchError(err => {
        console.error('Error cargando data/personajes.json', err);
        return of([] as Personaje[]);
      })
    ),
    { initialValue: [] as Personaje[] }
  );

  readonly reinos = toSignal(
    this.http.get<Reino[]>('data/reinos.json').pipe(
      catchError(err => {
        console.error('Error cargando data/reinos.json', err);
        return of([] as Reino[]);
      })
    ),
    { initialValue: [] as Reino[] }
  );

  // Signals reactivos para filtrado en memoria
  readonly filtroReino = signal<string>('todos');
  readonly filtroEscuadron = signal<string>('todos');
  readonly busqueda = signal<string>('');

  // Computed reactivo para personajes filtrados
  readonly personajesFiltrados = computed(() => {
    const list = this.personajes();
    const reino = this.filtroReino();
    const escuadron = this.filtroEscuadron();
    const query = this.busqueda().trim().toLowerCase();

    return list.filter(p => {
      const cumpleReino = reino === 'todos' || p.reino.toLowerCase() === reino.toLowerCase();
      const cumpleEscuadron = escuadron === 'todos' || p.escuadron.toLowerCase() === escuadron.toLowerCase();
      const cumpleBusqueda =
        !query ||
        p.nombre.toLowerCase().includes(query) ||
        p.magia.toLowerCase().includes(query) ||
        p.escuadron.toLowerCase().includes(query) ||
        p.biografia.toLowerCase().includes(query);

      return cumpleReino && cumpleEscuadron && cumpleBusqueda;
    });
  });

  // Lista única de escuadrones presentes en los datos
  readonly escuadronesDisponibles = computed(() => {
    const esc = new Set<string>();
    for (const p of this.personajes()) {
      if (p.escuadron) esc.add(p.escuadron);
    }
    return Array.from(esc);
  });

  obtenerPersonajePorId(id: string): Personaje | undefined {
    return this.personajes().find(p => p.id.toLowerCase() === id.toLowerCase());
  }

  obtenerReinoPorSlug(slug: string): Reino | undefined {
    return this.reinos().find(r => r.slug.toLowerCase() === slug.toLowerCase() || r.id.toLowerCase() === slug.toLowerCase());
  }
}
