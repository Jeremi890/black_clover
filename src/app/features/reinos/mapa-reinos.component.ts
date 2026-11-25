import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatosCloverService } from '../../core/services/datos-clover.service';
import { GrimorioStateService } from '../../core/services/grimorio-state.service';
import { TemaMagicoService } from '../../core/services/tema-magico.service';
import { Reino } from '../../core/models/reino.model';
import { EmblemaSvgComponent, TipoEmblema } from '../../shared/components/emblema-svg/emblema-svg.component';
import { AuraHoverDirective } from '../../shared/directives/aura-hover.directive';

@Component({
  selector: 'app-mapa-reinos',
  standalone: true,
  imports: [CommonModule, RouterLink, EmblemaSvgComponent, AuraHoverDirective],
  template: `
    <main class="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-labelledby="reinos-title">
      <!-- Encabezado del Mapa Continental -->
      <header class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-3">
          <app-emblema-svg tipo="reino-trebol" [size]="16" [glow]="false"></app-emblema-svg>
          <span>Atlas Geográfico y Dinástico</span>
        </div>
        <h1 id="reinos-title" class="text-4xl sm:text-5xl font-black font-fantasy tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-rose-300 drop-shadow">
          Los Cuatro Grandes Reinos
        </h1>
        <p class="mt-2 text-slate-400 font-serif max-w-2xl mx-auto text-sm sm:text-base">
          El continente mágico se divide entre cuatro soberanías ancestrales marcadas por los naipes de la baraja: Trébol, Pica, Corazón y Diamante. Pasa el cursor sobre un reino para sintonizar su maná continental o abre su crónica en 3D.
        </p>
      </header>

      <!-- Grilla interactiva de los 4 Reinos -->
      <section aria-label="Cuatro Grandes Reinos" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        @for (reino of reinos(); track reino.id) {
          <article
            appAuraHover
            [escalaHover]="1.02"
            [elevacionY]="-6"
            (mouseenter)="previsualizarAtmosfera(reino)"
            (mouseleave)="restaurarAtmosfera()"
            class="group relative rounded-3xl overflow-hidden border border-amber-900/40 bg-gradient-to-b from-[#1c1613] to-[#0c0907] p-8 flex flex-col justify-between shadow-2xl transition-all duration-300"
            [style.borderColor]="reino.perfilVisual.colorPrimario + '55'"
          >
            <!-- Resplandor dinámico en hover y atmósfera activa -->
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              [style.boxShadow]="'inset 0 0 45px ' + reino.perfilVisual.colorPrimario + '33, 0 0 30px -5px ' + reino.perfilVisual.colorPrimario + '44'"
            ></div>

            <div>
              <!-- Emblema y Título -->
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                  <div class="p-3.5 rounded-2xl bg-black/60 border border-amber-500/30 shadow-inner group-hover:scale-110 transition-transform">
                    <app-emblema-svg
                      [tipo]="obtenerTipoEmblema(reino.nombre)"
                      [size]="46"
                      [color]="reino.perfilVisual.colorPrimario"
                      [glow]="true"
                    ></app-emblema-svg>
                  </div>
                  <div>
                    <span class="text-xs uppercase font-mono tracking-widest text-amber-400">
                      Soberanía Mágica
                    </span>
                    <h2 class="text-2xl font-black text-amber-100 font-fantasy tracking-wide">
                      {{ reino.tituloCompleto }}
                    </h2>
                  </div>
                </div>

                <span class="text-xs font-mono font-bold text-amber-300 border border-amber-700/50 px-2.5 py-1 rounded-full bg-black/50">
                  {{ reino.escenarios.length || 0 }} Regiones
                </span>
              </div>

              <!-- Resumen histórico -->
              <p class="text-sm text-slate-300 font-serif leading-relaxed line-clamp-3 mb-6">
                {{ reino.resumen }}
              </p>

              <!-- Miniatura de Escenarios Clave -->
              <div class="space-y-2 mb-6">
                <span class="text-xs font-fantasy uppercase text-amber-400/80 tracking-wider block">
                  Lugares Emblemáticos
                </span>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  @for (esc of reino.escenarios; track esc.id) {
                    <div class="p-2 rounded-lg bg-black/40 border border-amber-900/30 truncate">
                      <span class="font-bold text-amber-200 block truncate">{{ esc.nombre }}</span>
                      <span class="text-[10px] text-slate-400 truncate block">{{ esc.subtitulo }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Acciones: Abrir Grimorio de Crónicas o Vista Detallada -->
            <div class="pt-4 border-t border-amber-900/40 flex items-center justify-between gap-3">
              <a
                [routerLink]="['/reinos', reino.slug]"
                class="text-xs font-serif text-amber-400 hover:text-amber-200 underline underline-offset-4 transition-colors font-semibold"
              >
                Explorar Territorio &rarr;
              </a>

              <button
                type="button"
                (click)="abrirCronicaGrimorio(reino)"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-fantasy uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                [style.backgroundColor]="reino.perfilVisual.colorPrimario"
              >
                <span>Crónica 3D</span>
                <span>📖</span>
              </button>
            </div>
          </article>
        }
      </section>
    </main>
  `
})
export class MapaReinosComponent {
  private readonly datosClover = inject(DatosCloverService);
  private readonly grimorioState = inject(GrimorioStateService);
  private readonly temaMagico = inject(TemaMagicoService);
  private readonly location = inject(Location);

  readonly reinos = this.datosClover.reinos;

  obtenerTipoEmblema(nombre: string): TipoEmblema {
    if (nombre === 'Trébol') return 'reino-trebol';
    if (nombre === 'Pica') return 'reino-pica';
    if (nombre === 'Corazón') return 'reino-corazon';
    return 'reino-diamante';
  }

  previsualizarAtmosfera(reino: Reino) {
    if (!this.grimorioState.estaAbierto()) {
      this.temaMagico.setTemaManual(reino.perfilVisual);
    }
  }

  restaurarAtmosfera() {
    if (!this.grimorioState.estaAbierto()) {
      this.temaMagico.resetTemaManual();
    }
  }

  abrirCronicaGrimorio(reino: Reino) {
    this.grimorioState.abrirReino(reino, 0);
    try {
      this.location.replaceState(`/reinos/${reino.slug}`);
    } catch {
      // Entorno de testing
    }
  }
}
