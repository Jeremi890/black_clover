import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatosCloverService } from '../../core/services/datos-clover.service';
import { GrimorioStateService } from '../../core/services/grimorio-state.service';
import { Reino } from '../../core/models/reino.model';
import { Personaje } from '../../core/models/personaje.model';
import { TarjetaPersonajeComponent } from '../personajes/tarjeta-personaje.component';
import { EmblemaSvgComponent, TipoEmblema } from '../../shared/components/emblema-svg/emblema-svg.component';

@Component({
  selector: 'app-vista-reino',
  standalone: true,
  imports: [CommonModule, RouterLink, TarjetaPersonajeComponent, EmblemaSvgComponent],
  template: `
    @if (reinoActual(); as r) {
      <main class="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-labelledby="vista-reino-title">
        <!-- Migajas de Pan / Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <a routerLink="/reinos" class="hover:text-amber-300 transition-colors">Reinos</a>
          <span>/</span>
          <span class="text-amber-300 font-bold">{{ r.nombre }}</span>
        </nav>

        <!-- Banner Dinástico del Reino -->
        <header
          class="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-amber-800/40 bg-gradient-to-r from-[#1e1713] via-[#120e0a] to-[#0a0705] mb-12 shadow-2xl"
          [style.borderColor]="r.perfilVisual.colorPrimario + '66'"
        >
          <div
            class="absolute inset-0 opacity-20 pointer-events-none"
            [style.background]="'radial-gradient(circle at 80% 50%, ' + r.perfilVisual.colorPrimario + ' 0%, transparent 60%)'"
          ></div>

          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex items-center gap-6">
              <div class="p-4 rounded-3xl bg-black/70 border border-amber-500/40 shadow-2xl">
                <app-emblema-svg
                  [tipo]="obtenerTipoEmblema(r.nombre)"
                  [size]="64"
                  [color]="r.perfilVisual.colorPrimario"
                  [glow]="true"
                ></app-emblema-svg>
              </div>

              <div>
                <span class="text-xs uppercase font-mono tracking-widest text-amber-400">
                  Soberanía Territorial
                </span>
                <h1 id="vista-reino-title" class="text-3xl sm:text-5xl font-black font-fantasy text-amber-100 tracking-wide mt-1">
                  {{ r.tituloCompleto }}
                </h1>
                <p class="text-xs sm:text-sm font-serif text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  {{ r.resumen }}
                </p>
              </div>
            </div>

            <!-- Botón de Abrir Crónicas 3D -->
            <button
              type="button"
              (click)="abrirCronica3d(r)"
              class="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold font-fantasy uppercase tracking-wider text-white shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              [style.backgroundColor]="r.perfilVisual.colorPrimario"
            >
              <span>Abrir Crónica 3D</span>
              <span class="text-lg">📖</span>
            </button>
          </div>
        </header>

        <!-- Escenarios Principales del Reino -->
        <section class="mb-16">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold font-fantasy text-amber-200 tracking-wider">
              Escenarios y Bastiones Sagrados
            </h2>
            <span class="text-xs font-mono text-amber-400/80">
              {{ r.escenarios.length || 0 }} Lugares Registrados
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (esc of r.escenarios; track esc.id; let i = $index) {
              <article
                class="rounded-2xl overflow-hidden border border-amber-900/40 bg-black/50 shadow-xl flex flex-col justify-between"
              >
                <div class="h-44 relative overflow-hidden">
                  <img
                    [src]="esc.imagenUrl"
                    [alt]="esc.nombre"
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                  <span class="absolute bottom-2 left-3 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-500/30">
                    Escenario {{ i + 1 }}
                  </span>
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 class="text-lg font-bold font-fantasy text-amber-100">{{ esc.nombre }}</h3>
                    <p class="text-xs text-rose-400 font-serif italic mb-2">{{ esc.subtitulo }}</p>
                    <p class="text-xs text-slate-300 font-serif leading-relaxed line-clamp-3">
                      {{ esc.descripcion }}
                    </p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-amber-900/40 text-right">
                    <button
                      type="button"
                      (click)="abrirEscenarioEnGrimorio(r, i + 1)"
                      class="text-xs font-fantasy uppercase tracking-wider text-amber-400 hover:text-amber-200 transition-colors font-semibold"
                    >
                      Ver en Grimorio ➔
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>

        <!-- Magos Destacados de este Reino -->
        @if (magosDelReino().length > 0) {
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold font-fantasy text-amber-200 tracking-wider">
                Magos y Caballeros del {{ r.nombre }}
              </h2>
              <span class="text-xs font-mono text-amber-400/80">
                {{ magosDelReino().length }} Magos
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              @for (m of magosDelReino(); track m.id) {
                <app-tarjeta-personaje [personaje]="m"></app-tarjeta-personaje>
              }
            </div>
          </section>
        }
      </main>
    } @else {
      <!-- Fallback / Cargando -->
      <div class="min-h-screen pt-36 text-center text-slate-400 font-serif">
        <p>Buscando crónicas del reino...</p>
      </div>
    }
  `
})
export class VistaReinoComponent {
  private readonly datosClover = inject(DatosCloverService);
  private readonly grimorioState = inject(GrimorioStateService);

  // Deep link parameter /reinos/:slug
  readonly slug = input<string | undefined>(undefined);

  readonly reinoActual = computed<Reino | undefined>(() => {
    const s = this.slug();
    if (!s) return undefined;
    return this.datosClover.obtenerReinoPorSlug(s);
  });

  readonly magosDelReino = computed<Personaje[]>(() => {
    const r = this.reinoActual();
    if (!r) return [];
    return this.datosClover.personajes().filter(p =>
      p.reino.toLowerCase() === r.nombre.toLowerCase()
    );
  });

  obtenerTipoEmblema(nombre: string): TipoEmblema {
    if (nombre === 'Trébol') return 'reino-trebol';
    if (nombre === 'Pica') return 'reino-pica';
    if (nombre === 'Corazón') return 'reino-corazon';
    return 'reino-diamante';
  }

  abrirCronica3d(reino: Reino) {
    this.grimorioState.abrirReino(reino, 0);
  }

  abrirEscenarioEnGrimorio(reino: Reino, pagina: number) {
    this.grimorioState.abrirReino(reino, pagina);
  }
}
