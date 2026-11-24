import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatosCloverService } from '../../core/services/datos-clover.service';
import { GrimorioStateService } from '../../core/services/grimorio-state.service';
import { ProgresoJugadorService } from '../../core/services/progreso-jugador.service';
import { FEATURE_FLAGS } from '../../core/config/feature-flags';
import { TarjetaPersonajeComponent } from '../personajes/tarjeta-personaje.component';
import { EmblemaSvgComponent } from '../../shared/components/emblema-svg/emblema-svg.component';
import { AuraHoverDirective } from '../../shared/directives/aura-hover.directive';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, TarjetaPersonajeComponent, EmblemaSvgComponent, AuraHoverDirective],
  template: `
    <main class="min-h-screen pt-20 pb-24 overflow-hidden relative" aria-labelledby="hero-title">
      <!-- ================= HERO SECTION CINEMÁTICA ================= -->
      <section class="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12 pb-20 text-center flex flex-col items-center">
        <!-- Badge de Grimorio -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-amber-500/40 backdrop-blur-md text-amber-300 text-xs font-mono uppercase tracking-widest mb-6 shadow-xl">
          <app-emblema-svg tipo="trebol-5" [size]="18" [glow]="true"></app-emblema-svg>
          <span>Black Clover • Experiencia 3D Interactiva</span>
        </div>

        <!-- Título Principal Épico -->
        <h1
          id="hero-title"
          class="text-5xl sm:text-7xl lg:text-8xl font-black font-fantasy tracking-wider uppercase leading-none drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500/90"
        >
          Grimorio Físico 3D
        </h1>

        <!-- Leyenda Clásica del Trébol -->
        <div class="mt-6 max-w-3xl mx-auto space-y-2">
          <p class="text-sm sm:text-base md:text-lg font-serif italic text-amber-100/90 leading-relaxed">
            "Las tres hojas del trébol representan la <span class="text-emerald-400 font-bold">Esperanza</span>, la <span class="text-cyan-400 font-bold">Fe</span> y el <span class="text-rose-400 font-bold">Amor</span>.
            En la cuarta hoja reside la <span class="text-amber-300 font-bold">Buena Fortuna</span>...
            Y en la quinta hoja... <span class="text-rose-500 font-bold tracking-wide">anida un Demonio</span>."
          </p>
        </div>

        <!-- Botones de Acción Principal -->
        <div class="mt-8 flex flex-wrap gap-4 justify-center items-center">
          <a
            routerLink="/personajes"
            class="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-fantasy text-sm font-bold tracking-widest uppercase shadow-2xl transition-all duration-300 hover:scale-105 magic-glow"
          >
            Abrir Grimorios de Magos
          </a>

          <a
            routerLink="/reinos"
            class="px-8 py-4 rounded-2xl bg-black/70 hover:bg-black/90 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-fantasy text-sm font-bold tracking-widest uppercase backdrop-blur-md transition-all duration-300 hover:scale-105"
          >
            Mapa de los 4 Reinos
          </a>
        </div>

        <!-- HUD Rápido de Estado y Stand-by -->
        <div class="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-amber-300 shadow">
            <app-emblema-svg tipo="estrella" [size]="16" [glow]="false"></app-emblema-svg>
            <span>Estrellas Mágicas: <strong>{{ estrellasTotales() }}</strong></span>
          </div>

          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-slate-700 text-slate-400">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Motor 3D: GSAP Timeline + CSS 3D Preserve</span>
          </div>

          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-slate-800 text-slate-400">
            <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="minijuegoHabilitado" [class.bg-slate-600]="!minijuegoHabilitado"></span>
            <span>Minijuego Runner: {{ minijuegoHabilitado ? 'Activo' : 'Stand-by (0 KB)' }}</span>
          </div>
        </div>
      </section>

      <!-- ================= SECCIÓN DE MAGOS DESTACADOS ================= -->
      <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12" aria-labelledby="destacados-title">
        <div class="flex items-end justify-between mb-8">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-rose-500">
              Grimorios de Combate
            </span>
            <h2 id="destacados-title" class="text-3xl font-black font-fantasy text-amber-100 tracking-wide mt-1">
              Magos Principales
            </h2>
          </div>

          <a
            routerLink="/personajes"
            class="text-xs font-fantasy uppercase tracking-wider text-amber-400 hover:text-amber-200 transition-colors"
          >
            Ver Todos los Magos &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-tarjeta-personaje
            *ngFor="let p of personajesDestacados()"
            [personaje]="p"
          ></app-tarjeta-personaje>
        </div>
      </section>

      <!-- ================= RESUMEN DE LOS 4 REINOS ================= -->
      <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 border-t border-amber-900/30" aria-labelledby="reinos-preview-title">
        <div class="flex items-end justify-between mb-8">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-amber-500">
              Atlas y Crónicas
            </span>
            <h2 id="reinos-preview-title" class="text-3xl font-black font-fantasy text-amber-100 tracking-wide mt-1">
              Las Cuatro Grandes Potencias
            </h2>
          </div>

          <a
            routerLink="/reinos"
            class="text-xs font-fantasy uppercase tracking-wider text-amber-400 hover:text-amber-200 transition-colors"
          >
            Explorar Atlas &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            *ngFor="let r of reinos()"
            (click)="abrirReino(r)"
            appAuraHover
            class="p-6 rounded-2xl bg-gradient-to-b from-[#181310] to-[#0a0705] border border-amber-900/40 hover:border-amber-500/50 cursor-pointer transition-all duration-300 flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <app-emblema-svg
                  [tipo]="obtenerTipoEmblema(r.nombre)"
                  [size]="36"
                  [color]="r.perfilVisual.colorPrimario"
                  [glow]="true"
                ></app-emblema-svg>
                <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/60 text-slate-400 border border-slate-700/60">
                  {{ r.escenarios?.length || 0 }} Regiones
                </span>
              </div>

              <h3 class="text-lg font-bold font-fantasy text-amber-100 group-hover:text-amber-300 transition-colors">
                {{ r.nombre }}
              </h3>
              <p class="text-xs text-slate-400 font-serif line-clamp-3 mt-2 leading-relaxed">
                {{ r.resumen }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-amber-900/30 flex items-center justify-between text-xs text-amber-400 font-mono">
              <span>Abrir Crónica 3D</span>
              <span>➔</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  `
})
export class InicioComponent {
  private datosClover = inject(DatosCloverService);
  private grimorioState = inject(GrimorioStateService);
  private progresoService = inject(ProgresoJugadorService);

  readonly personajes = this.datosClover.personajes;
  readonly reinos = this.datosClover.reinos;
  readonly estrellasTotales = this.progresoService.estrellasTotales;
  readonly minijuegoHabilitado = FEATURE_FLAGS.minijuegoActivo;

  readonly personajesDestacados = () => {
    return this.personajes().slice(0, 4);
  };

  abrirReino(reino: any) {
    this.grimorioState.abrirReino(reino, 0);
  }

  obtenerTipoEmblema(nombre: string): any {
    if (nombre === 'Trébol') return 'reino-trebol';
    if (nombre === 'Pica') return 'reino-pica';
    if (nombre === 'Corazón') return 'reino-corazon';
    return 'reino-diamante';
  }
}
