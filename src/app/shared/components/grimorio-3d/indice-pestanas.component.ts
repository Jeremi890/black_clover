import { Component, input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Personaje } from '../../../core/models/personaje.model';
import { Reino } from '../../../core/models/reino.model';
import { GrimorioStateService } from '../../../core/services/grimorio-state.service';

@Component({
  selector: 'app-indice-pestanas',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modo() === 'horizontal') {
      <!-- ================= MODO HORIZONTAL (< lg / Móvil y Tablet) ================= -->
      <nav class="flex flex-row overflow-x-auto whitespace-nowrap gap-2 py-1 px-1 scrollbar-none pointer-events-auto w-full items-center" aria-label="Índice del Grimorio">
        <!-- Pestaña 0: Biografía / Resumen del Reino -->
        <button
          type="button"
          (click)="seleccionarPagina(0)"
          [disabled]="estaAnimando()"
          class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-fantasy tracking-wider uppercase transition-all duration-200 min-h-[36px]"
          [class.bg-amber-950/90]="paginaActual() === 0"
          [class.text-amber-300]="paginaActual() === 0"
          [class.border-amber-400]="paginaActual() === 0"
          [class.shadow-md]="paginaActual() === 0"
          [class.bg-black/75]="paginaActual() !== 0"
          [class.text-slate-400]="paginaActual() !== 0"
          [class.border-slate-800]="paginaActual() !== 0"
          [style.borderColor]="paginaActual() === 0 ? 'var(--color-primario, #e11d48)' : ''"
        >
          <span class="w-4 h-4 rounded-full bg-black/60 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold">I</span>
          <span>{{ esPersonaje() ? 'Biografía' : 'Crónica' }}</span>
        </button>

        <!-- Pestañas para cada Hechizo (Personaje) -->
        @if (esPersonaje() && personaje(); as p) {
          @for (h of p.hechizos; track h.id; let i = $index) {
            <button
              type="button"
              (click)="seleccionarPagina(i + 1)"
              [disabled]="estaAnimando()"
              class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-fantasy tracking-wider uppercase transition-all duration-200 min-h-[36px]"
              [class.bg-amber-950/90]="paginaActual() === i + 1"
              [class.text-amber-300]="paginaActual() === i + 1"
              [class.border-amber-400]="paginaActual() === i + 1"
              [class.shadow-md]="paginaActual() === i + 1"
              [class.bg-black/75]="paginaActual() !== i + 1"
              [class.text-slate-400]="paginaActual() !== i + 1"
              [class.border-slate-800]="paginaActual() !== i + 1"
              [style.borderColor]="paginaActual() === i + 1 ? 'var(--color-primario, #e11d48)' : ''"
            >
              <span class="w-4 h-4 rounded-full bg-black/60 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold">{{ i + 1 }}</span>
              <span>{{ h.nombre.split(':')[0] }}</span>
            </button>
          }
        }

        <!-- Pestañas para cada Escenario (Reino) -->
        @if (!esPersonaje() && reino(); as r) {
          @for (esc of r.escenarios; track esc.id; let i = $index) {
            <button
              type="button"
              (click)="seleccionarPagina(i + 1)"
              [disabled]="estaAnimando()"
              class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-fantasy tracking-wider uppercase transition-all duration-200 min-h-[36px]"
              [class.bg-amber-950/90]="paginaActual() === i + 1"
              [class.text-amber-300]="paginaActual() === i + 1"
              [class.border-amber-400]="paginaActual() === i + 1"
              [class.shadow-md]="paginaActual() === i + 1"
              [class.bg-black/75]="paginaActual() !== i + 1"
              [class.text-slate-400]="paginaActual() !== i + 1"
              [class.border-slate-800]="paginaActual() !== i + 1"
              [style.borderColor]="paginaActual() === i + 1 ? 'var(--color-primario, #e11d48)' : ''"
            >
              <span class="w-4 h-4 rounded-full bg-black/60 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold">{{ i + 1 }}</span>
              <span>{{ esc.nombre }}</span>
            </button>
          }
        }
      </nav>
    } @else {
      <!-- ================= MODO VERTICAL (>= lg / Escritorio Borde Derecho) ================= -->
      <nav class="flex flex-col gap-2 pointer-events-auto" aria-label="Índice del Grimorio">
        <!-- Pestaña 0: Biografía / Resumen del Reino -->
        <button
          type="button"
          (click)="seleccionarPagina(0)"
          [disabled]="estaAnimando()"
          class="group relative flex items-center gap-2 px-3 py-2 rounded-r-xl transition-all duration-300 text-left border-l-4 shadow-md"
          [class.bg-amber-950/90]="paginaActual() === 0"
          [class.text-amber-300]="paginaActual() === 0"
          [class.border-amber-400]="paginaActual() === 0"
          [class.shadow-amber-900/30]="paginaActual() === 0"
          [class.bg-black/75]="paginaActual() !== 0"
          [class.text-slate-400]="paginaActual() !== 0"
          [class.border-slate-700]="paginaActual() !== 0"
          [class.hover:bg-slate-900/95]="paginaActual() !== 0"
          [class.hover:text-slate-200]="paginaActual() !== 0"
          [style.borderLeftColor]="paginaActual() === 0 ? 'var(--color-primario, #e11d48)' : ''"
        >
          <span class="w-5 h-5 flex items-center justify-center font-serif text-[11px] font-bold rounded-full bg-black/50 border border-amber-400/40">
            I
          </span>
          <span class="text-xs font-semibold font-fantasy tracking-wider uppercase truncate max-w-[110px]">
            {{ esPersonaje() ? 'Biografía' : 'Crónica' }}
          </span>
          @if (paginaActual() === 0) {
            <div
              class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
              [style.backgroundColor]="'var(--color-primario, #e11d48)'"
            ></div>
          }
        </button>

        <!-- Pestañas para cada Hechizo (Personaje) -->
        @if (esPersonaje() && personaje(); as p) {
          @for (h of p.hechizos; track h.id; let i = $index) {
            <button
              type="button"
              (click)="seleccionarPagina(i + 1)"
              [disabled]="estaAnimando()"
              class="group relative flex items-center gap-2 px-3 py-2 rounded-r-xl transition-all duration-300 text-left border-l-4 shadow-md"
              [class.bg-amber-950/90]="paginaActual() === i + 1"
              [class.text-amber-300]="paginaActual() === i + 1"
              [class.border-amber-400]="paginaActual() === i + 1"
              [class.shadow-amber-900/30]="paginaActual() === i + 1"
              [class.bg-black/75]="paginaActual() !== i + 1"
              [class.text-slate-400]="paginaActual() !== i + 1"
              [class.border-slate-700]="paginaActual() !== i + 1"
              [class.hover:bg-slate-900/95]="paginaActual() !== i + 1"
              [class.hover:text-slate-200]="paginaActual() !== i + 1"
              [style.borderLeftColor]="paginaActual() === i + 1 ? 'var(--color-primario, #e11d48)' : ''"
            >
              <span class="w-5 h-5 flex items-center justify-center font-serif text-[11px] font-bold rounded-full bg-black/50 border border-amber-400/40">
                {{ i + 1 }}
              </span>
              <div class="flex flex-col truncate max-w-[110px]">
                <span class="text-xs font-semibold tracking-wide truncate">
                  {{ h.nombre.split(':')[0] }}
                </span>
                <span class="text-[9px] text-amber-400/80 uppercase font-mono truncate">
                  {{ h.juego?.rol || 'Hechizo' }}
                </span>
              </div>

              @if (paginaActual() === i + 1) {
                <div
                  class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
                  [style.backgroundColor]="'var(--color-primario, #e11d48)'"
                ></div>
              }
            </button>
          }
        }

        <!-- Pestañas para cada Escenario (Reino) -->
        @if (!esPersonaje() && reino(); as r) {
          @for (esc of r.escenarios; track esc.id; let i = $index) {
            <button
              type="button"
              (click)="seleccionarPagina(i + 1)"
              [disabled]="estaAnimando()"
              class="group relative flex items-center gap-2 px-3 py-2 rounded-r-xl transition-all duration-300 text-left border-l-4 shadow-md"
              [class.bg-amber-950/90]="paginaActual() === i + 1"
              [class.text-amber-300]="paginaActual() === i + 1"
              [class.border-amber-400]="paginaActual() === i + 1"
              [class.shadow-amber-900/30]="paginaActual() === i + 1"
              [class.bg-black/75]="paginaActual() !== i + 1"
              [class.text-slate-400]="paginaActual() !== i + 1"
              [class.border-slate-700]="paginaActual() !== i + 1"
              [class.hover:bg-slate-900/95]="paginaActual() !== i + 1"
              [class.hover:text-slate-200]="paginaActual() !== i + 1"
              [style.borderLeftColor]="paginaActual() === i + 1 ? 'var(--color-primario, #e11d48)' : ''"
            >
              <span class="w-5 h-5 flex items-center justify-center font-serif text-[11px] font-bold rounded-full bg-black/50 border border-amber-400/40">
                {{ i + 1 }}
              </span>
              <span class="text-xs font-semibold tracking-wide truncate max-w-[110px]">
                {{ esc.nombre }}
              </span>

              @if (paginaActual() === i + 1) {
                <div
                  class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
                  [style.backgroundColor]="'var(--color-primario, #e11d48)'"
                ></div>
              }
            </button>
          }
        }
      </nav>
    }
  `
})
export class IndicePestanasComponent {
  private readonly grimorioState = inject(GrimorioStateService);

  readonly personaje = input<Personaje | null>(null);
  readonly reino = input<Reino | null>(null);
  readonly paginaActual = input<number>(0);
  readonly estaAnimando = input<boolean>(false);
  readonly modo = input<'horizontal' | 'vertical'>('vertical');

  @Output() readonly cambiarPagina = new EventEmitter<number>();

  readonly esPersonaje = computed(() => !!this.personaje());

  seleccionarPagina(num: number) {
    if (this.estaAnimando()) return;
    this.grimorioState.irAPagina(num);
    this.cambiarPagina.emit(num);
  }
}
