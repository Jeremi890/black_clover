import { Component, input, effect, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosCloverService } from '../../core/services/datos-clover.service';
import { GrimorioStateService } from '../../core/services/grimorio-state.service';
import { TarjetaPersonajeComponent } from './tarjeta-personaje.component';
import { EmblemaSvgComponent } from '../../shared/components/emblema-svg/emblema-svg.component';

@Component({
  selector: 'app-galeria-personajes',
  standalone: true,
  imports: [CommonModule, FormsModule, TarjetaPersonajeComponent, EmblemaSvgComponent],
  template: `
    <main class="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-labelledby="galeria-title">
      <!-- Encabezado de la Galería -->
      <header class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono uppercase tracking-widest mb-3">
          <app-emblema-svg tipo="trebol-5" [size]="16" [glow]="false"></app-emblema-svg>
          <span>Portadores de Grimorio</span>
        </div>
        <h1 id="galeria-title" class="text-4xl sm:text-5xl font-black font-fantasy tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-100 drop-shadow">
          Caballeros Mágicos y Soberanos
        </h1>
        <p class="mt-2 text-slate-400 font-serif max-w-2xl mx-auto text-sm sm:text-base">
          Explora los grimorios de los magos más sobresalientes de los cuatro reinos. Haz clic en cualquier tarjeta para abrir su libro interactivo en 3D y descubrir sus hechizos y videos de combate.
        </p>
      </header>

      <!-- Barra de Filtros y Búsqueda conectada a Signals (sin backdrop-blur para alto rendimiento) -->
      <section class="mb-10 p-4 sm:p-5 rounded-2xl bg-[#0c0908]/90 border border-amber-900/40 shadow-xl space-y-4" aria-label="Filtros de Personajes">
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <!-- Búsqueda en Vivo -->
          <div class="relative w-full sm:flex-1 sm:max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              [ngModel]="busqueda()"
              (ngModelChange)="busqueda.set($event)"
              placeholder="Buscar por nombre, magia o escuadrón..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-sans"
            />
          </div>

          <!-- Selector de Escuadrón -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <label for="filtro-escuadron-select" class="text-xs font-mono uppercase tracking-wider text-amber-400 whitespace-nowrap">
              Escuadrón:
            </label>
            <select
              id="filtro-escuadron-select"
              [ngModel]="filtroEscuadron()"
              (ngModelChange)="filtroEscuadron.set($event)"
              class="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-rose-500 transition-all font-sans flex-1 sm:flex-initial"
            >
              <option value="todos">Todos los Escuadrones</option>
              @for (esc of escuadrones(); track esc) {
                <option [value]="esc">{{ esc }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Filtros Rápidos por Reino (scroll horizontal en pantallas pequeñas) -->
        <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto pb-1.5 scrollbar-none whitespace-nowrap">
          <span class="text-xs font-mono uppercase tracking-wider text-slate-400 mr-1 shrink-0">Reino:</span>
          @for (r of ['todos', 'Trébol', 'Pica', 'Corazón', 'Diamante']; track r) {
            <button
              type="button"
              (click)="filtroReino.set(r)"
              class="px-3 py-1.5 rounded-lg text-xs font-fantasy tracking-wider uppercase transition-all duration-200 shrink-0 cursor-pointer"
              [class.bg-rose-600]="filtroReino() === r"
              [class.text-white]="filtroReino() === r"
              [class.shadow-md]="filtroReino() === r"
              [class.bg-slate-900/80]="filtroReino() !== r"
              [class.text-slate-400]="filtroReino() !== r"
              [class.hover:text-slate-200]="filtroReino() !== r"
              [class.hover:bg-slate-800]="filtroReino() !== r"
            >
              {{ r === 'todos' ? 'Todos' : r }}
            </button>
          }

          <span class="ml-auto text-xs font-mono text-amber-400/80 pl-2 shrink-0">
            {{ personajes().length }} Resultados
          </span>
        </div>
      </section>

      <!-- Grilla de Tarjetas -->
      <section aria-label="Resultados de Personajes">
        @if (personajes().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            @for (p of personajes(); track p.id) {
              <app-tarjeta-personaje [personaje]="p"></app-tarjeta-personaje>
            }
          </div>
        } @else {
          <!-- Estado Vacío -->
          <div class="text-center py-20 p-8 rounded-2xl bg-[#0c0908]/80 border border-slate-800/80 max-w-md mx-auto">
            <span class="text-4xl block mb-3">📜</span>
            <h3 class="text-lg font-bold font-fantasy text-amber-200">No se encontraron grimorios</h3>
            <p class="text-xs text-slate-400 mt-1">
              Ningún caballero coincide con los filtros aplicados. Intenta restablecer la búsqueda.
            </p>
            <button
              type="button"
              (click)="restablecerFiltros()"
              class="mt-4 px-4 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-xs font-bold font-fantasy tracking-wider text-white transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        }
      </section>
    </main>
  `
})
export class GaleriaPersonajesComponent {
  private readonly datosClover = inject(DatosCloverService);
  private readonly grimorioState = inject(GrimorioStateService);
  private readonly location = inject(Location);

  // Parámetro de ruta Deep Link /personajes/:id vía withComponentInputBinding()
  readonly id = input<string | undefined>(undefined);

  readonly personajes = this.datosClover.personajesFiltrados;
  readonly escuadrones = this.datosClover.escuadronesDisponibles;
  readonly filtroReino = this.datosClover.filtroReino;
  readonly filtroEscuadron = this.datosClover.filtroEscuadron;
  readonly busqueda = this.datosClover.busqueda;

  constructor() {
    // 1. Deep linking reactivo: Si la URL es /personajes/:id, abre el grimorio automáticamente
    effect(() => {
      const targetId = this.id();
      const todos = this.datosClover.personajes();
      if (targetId && todos.length > 0) {
        const p = this.datosClover.obtenerPersonajePorId(targetId);
        if (p && !this.grimorioState.estaAbierto()) {
          this.grimorioState.abrirPersonaje(p, 0);
        }
      }
    });

    // 2. Sincronización exclusiva de Location.replaceState() dentro de la galería:
    // Al abrir un personaje, actualiza la URL a /personajes/:id; al cerrar, la restaura siempre a /personajes
    effect(() => {
      const abierto = this.grimorioState.estaAbierto();
      const p = this.grimorioState.personajeActivo();

      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/personajes')) {
        try {
          if (abierto && p) {
            this.location.replaceState(`/personajes/${p.id}`);
          } else if (!abierto) {
            this.location.replaceState('/personajes');
          }
        } catch {
          // Entorno de testing
        }
      }
    });
  }

  restablecerFiltros() {
    this.filtroReino.set('todos');
    this.filtroEscuadron.set('todos');
    this.busqueda.set('');
  }
}
