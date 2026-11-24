import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

      <!-- Barra de Filtros y Búsqueda -->
      <section class="mb-10 p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-900/40 shadow-xl space-y-4" aria-label="Filtros de Personajes">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <!-- Búsqueda en Vivo -->
          <div class="relative w-full md:w-96">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              [ngModel]="busqueda()"
              (ngModelChange)="busqueda.set($event)"
              placeholder="Buscar por nombre, magia o escuadrón..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-sans"
            />
          </div>

          <!-- Selector de Escuadrón -->
          <div class="flex items-center gap-2 w-full md:w-auto">
            <label for="filtro-escuadron-select" class="text-xs font-mono uppercase tracking-wider text-amber-400 whitespace-nowrap">
              Escuadrón:
            </label>
            <select
              id="filtro-escuadron-select"
              [ngModel]="filtroEscuadron()"
              (ngModelChange)="filtroEscuadron.set($event)"
              class="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-rose-500 transition-all font-sans"
            >
              <option value="todos">Todos los Escuadrones</option>
              <option *ngFor="let esc of escuadrones()" [value]="esc">{{ esc }}</option>
            </select>
          </div>
        </div>

        <!-- Filtros Rápidos por Reino -->
        <div class="flex flex-wrap gap-2 items-center pt-2 border-t border-slate-800/80">
          <span class="text-xs font-mono uppercase tracking-wider text-slate-400 mr-2">Reino:</span>
          <button
            type="button"
            *ngFor="let r of ['todos', 'Trébol', 'Pica', 'Corazón', 'Diamante']"
            (click)="filtroReino.set(r)"
            class="px-3 py-1 rounded-lg text-xs font-fantasy tracking-wider uppercase transition-all duration-200"
            [class.bg-rose-600]="filtroReino() === r"
            [class.text-white]="filtroReino() === r"
            [class.shadow-md]="filtroReino() === r"
            [class.bg-slate-900/70]="filtroReino() !== r"
            [class.text-slate-400]="filtroReino() !== r"
            [class.hover:text-slate-200]="filtroReino() !== r"
            [class.hover:bg-slate-800]="filtroReino() !== r"
          >
            {{ r === 'todos' ? 'Todos' : r }}
          </button>

          <span class="ml-auto text-xs font-mono text-amber-400/80">
            {{ personajes().length }} Resultados
          </span>
        </div>
      </section>

      <!-- Grilla de Tarjetas -->
      <section aria-label="Resultados de Personajes">
        <div *ngIf="personajes().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <app-tarjeta-personaje
            *ngFor="let p of personajes()"
            [personaje]="p"
          ></app-tarjeta-personaje>
        </div>

        <!-- Estado Vacío -->
        <div
          *ngIf="personajes().length === 0"
          class="text-center py-20 p-8 rounded-2xl bg-black/40 border border-slate-800/80 max-w-md mx-auto"
        >
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
      </section>
    </main>
  `
})
export class GaleriaPersonajesComponent implements OnInit {
  private datosClover = inject(DatosCloverService);
  private grimorioState = inject(GrimorioStateService);

  @Input() id?: string; // Deep Link: /personajes/:id vía withComponentInputBinding()

  readonly personajes = this.datosClover.personajesFiltrados;
  readonly escuadrones = this.datosClover.escuadronesDisponibles;
  readonly filtroReino = this.datosClover.filtroReino;
  readonly filtroEscuadron = this.datosClover.filtroEscuadron;
  readonly busqueda = this.datosClover.busqueda;

  ngOnInit() {
    // Si viene un :id en la URL, abrir automáticamente el grimorio correspondiente
    if (this.id) {
      // Si la lista de personajes aún se está cargando, intentamos tras un breve instante
      setTimeout(() => {
        const target = this.datosClover.obtenerPersonajePorId(this.id!);
        if (target) {
          this.grimorioState.abrirPersonaje(target, 0);
        }
      }, 250);
    }
  }

  restablecerFiltros() {
    this.filtroReino.set('todos');
    this.filtroEscuadron.set('todos');
    this.busqueda.set('');
  }
}
