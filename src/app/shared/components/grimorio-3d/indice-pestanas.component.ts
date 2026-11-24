import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Personaje, Hechizo } from '../../../core/models/personaje.model';
import { Reino, Escenario } from '../../../core/models/reino.model';
import { ProgresoJugadorService } from '../../../core/services/progreso-jugador.service';

@Component({
  selector: 'app-indice-pestanas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="flex flex-col gap-2 pointer-events-auto" aria-label="Índice del Grimorio">
      <!-- Pestaña 0: Biografía / Resumen del Reino -->
      <button
        type="button"
        (click)="seleccionarPagina(0)"
        [disabled]="estaAnimando"
        class="group relative flex items-center gap-2 px-3 py-2 rounded-r-xl transition-all duration-300 text-left border-l-4"
        [class.bg-amber-950/80]="paginaActual === 0"
        [class.text-amber-300]="paginaActual === 0"
        [class.border-amber-400]="paginaActual === 0"
        [class.shadow-lg]="paginaActual === 0"
        [class.bg-black/60]="paginaActual !== 0"
        [class.text-slate-400]="paginaActual !== 0"
        [class.border-slate-700]="paginaActual !== 0"
        [class.hover:bg-slate-900/90]="paginaActual !== 0"
        [class.hover:text-slate-200]="paginaActual !== 0"
        [style.borderLeftColor]="paginaActual === 0 ? 'var(--color-primario, #e11d48)' : ''"
      >
        <span class="w-5 h-5 flex items-center justify-center font-serif text-xs font-bold rounded-full bg-black/40 border border-amber-400/40">
          I
        </span>
        <span class="text-xs font-medium font-fantasy tracking-wider uppercase truncate max-w-[110px]">
          {{ esPersonaje ? 'Biografía' : 'Crónica' }}
        </span>
        <div
          *ngIf="paginaActual === 0"
          class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
          [style.backgroundColor]="'var(--color-primario, #e11d48)'"
        ></div>
      </button>

      <!-- Pestañas para cada Hechizo (Personaje) -->
      <ng-container *ngIf="esPersonaje && personaje">
        <button
          *ngFor="let h of personaje.hechizos; let i = index"
          type="button"
          (click)="seleccionarPagina(i + 1)"
          [disabled]="estaAnimando"
          class="group relative flex items-center gap-2 px-3 py-2 rounded-r-xl transition-all duration-300 text-left border-l-4"
          [class.bg-amber-950/80]="paginaActual === i + 1"
          [class.text-amber-300]="paginaActual === i + 1"
          [class.shadow-lg]="paginaActual === i + 1"
          [class.bg-black/60]="paginaActual !== i + 1"
          [class.text-slate-400]="paginaActual !== i + 1"
          [class.border-slate-700]="paginaActual !== i + 1"
          [class.hover:bg-slate-900/90]="paginaActual !== i + 1"
          [class.hover:text-slate-200]="paginaActual !== i + 1"
          [style.borderLeftColor]="paginaActual === i + 1 ? 'var(--color-primario, #e11d48)' : ''"
        >
          <span class="w-5 h-5 flex items-center justify-center font-serif text-xs font-bold rounded-full bg-black/40 border border-amber-400/40">
            {{ i + 1 }}
          </span>
          <div class="flex flex-col truncate max-w-[110px]">
            <span class="text-xs font-medium tracking-wide truncate">
              {{ h.nombre.split(':')[0] }}
            </span>
            <span class="text-[9px] text-amber-400/70 truncate">
              {{ h.juego?.rol || 'Hechizo' }}
            </span>
          </div>

          <div
            *ngIf="paginaActual === i + 1"
            class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
            [style.backgroundColor]="'var(--color-primario, #e11d48)'"
          ></div>
        </button>
      </ng-container>

      <!-- Pestañas para cada Escenario (Reino) -->
      <ng-container *ngIf="!esPersonaje && reino">
        <button
          *ngFor="let esc of reino.escenarios; let i = index"
          type="button"
          (click)="seleccionarPagina(i + 1)"
          [disabled]="estaAnimando"
          class="group relative flex items-center gap-2 px-3 py-2 rounded-r-xl transition-all duration-300 text-left border-l-4"
          [class.bg-amber-950/80]="paginaActual === i + 1"
          [class.text-amber-300]="paginaActual === i + 1"
          [class.shadow-lg]="paginaActual === i + 1"
          [class.bg-black/60]="paginaActual !== i + 1"
          [class.text-slate-400]="paginaActual !== i + 1"
          [class.border-slate-700]="paginaActual !== i + 1"
          [class.hover:bg-slate-900/90]="paginaActual !== i + 1"
          [class.hover:text-slate-200]="paginaActual !== i + 1"
          [style.borderLeftColor]="paginaActual === i + 1 ? 'var(--color-primario, #e11d48)' : ''"
        >
          <span class="w-5 h-5 flex items-center justify-center font-serif text-xs font-bold rounded-full bg-black/40 border border-amber-400/40">
            {{ i + 1 }}
          </span>
          <span class="text-xs font-medium tracking-wide truncate max-w-[110px]">
            {{ esc.nombre }}
          </span>

          <div
            *ngIf="paginaActual === i + 1"
            class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
            [style.backgroundColor]="'var(--color-primario, #e11d48)'"
          ></div>
        </button>
      </ng-container>
    </nav>
  `
})
export class IndicePestanasComponent {
  private progresoService = inject(ProgresoJugadorService);

  @Input() personaje?: Personaje | null;
  @Input() reino?: Reino | null;
  @Input() paginaActual: number = 0;
  @Input() estaAnimando: boolean = false;
  @Output() cambiarPagina = new EventEmitter<number>();

  get esPersonaje(): boolean {
    return !!this.personaje;
  }

  seleccionarPagina(num: number) {
    if (this.estaAnimando) return;
    this.cambiarPagina.emit(num);
  }
}
