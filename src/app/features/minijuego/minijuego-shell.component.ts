import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgresoJugadorService } from '../../core/services/progreso-jugador.service';
import { DatosCloverService } from '../../core/services/datos-clover.service';
import { Personaje } from '../../core/models/personaje.model';

@Component({
  selector: 'app-minijuego-shell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="min-h-screen pt-24 pb-20 px-4 max-w-5xl mx-auto text-center" aria-labelledby="minijuego-title">
      <header class="p-8 rounded-3xl bg-[#0a0a0f]/90 border border-amber-500/40 shadow-2xl">
        <span class="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-2">
          Módulo de Batalla Runner (Stand-by)
        </span>
        <h1 id="minijuego-title" class="text-4xl font-black font-fantasy text-amber-100 tracking-wider">
          Misión de Asalto: {{ personaje?.nombre || 'Caballero Mágico' }}
        </h1>
        <p class="text-sm font-serif text-slate-300 mt-2 max-w-xl mx-auto">
          Arquitectura preparada para minijuego runner 60 FPS fuera de NgZone con recolección de estrellas y desbloqueo de hechizos del grimorio.
        </p>

        <!-- Canvas Container Mockup -->
        <div class="mt-8 h-96 w-full rounded-2xl bg-neutral-950 border-2 border-dashed border-amber-600/40 flex flex-col items-center justify-center p-6 text-slate-400">
          <span class="text-5xl mb-3">⚔️</span>
          <p class="font-fantasy text-lg text-amber-300">Canvas 2D / Phaser 3 Runner Engine</p>
          <p class="text-xs font-mono text-slate-500 mt-1">FEATURE_FLAGS.minijuegoActivo = false (Stand-by Protegido)</p>
          <a
            routerLink="/personajes"
            class="mt-6 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-fantasy text-xs font-bold uppercase tracking-wider hover:bg-rose-500 transition-colors"
          >
            Regresar a los Grimorios
          </a>
        </div>
      </header>
    </main>
  `
})
export class MinijuegoShellComponent implements OnInit {
  private progresoService = inject(ProgresoJugadorService);
  private datosClover = inject(DatosCloverService);

  @Input() personajeId?: string;
  personaje?: Personaje;

  ngOnInit() {
    if (this.personajeId) {
      this.personaje = this.datosClover.obtenerPersonajePorId(this.personajeId);
    }
  }
}
