import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ParticulasManaComponent } from './shared/components/particulas-mana/particulas-mana.component';
import { Grimorio3dComponent } from './shared/components/grimorio-3d/grimorio-3d.component';
import { EmblemaSvgComponent } from './shared/components/emblema-svg/emblema-svg.component';
import { TemaMagicoService } from './core/services/tema-magico.service';
import { ProgresoJugadorService } from './core/services/progreso-jugador.service';
import { GrimorioStateService } from './core/services/grimorio-state.service';
import { FEATURE_FLAGS } from './core/config/feature-flags';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ParticulasManaComponent,
    Grimorio3dComponent,
    EmblemaSvgComponent
  ],
  template: `
    <div class="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white bg-transparent">
      <!-- Atmósfera Mágica: Capa de Partículas de Maná con z-index reactivo (z-0 / z-[45]) -->
      <app-particulas-mana></app-particulas-mana>

      <!-- ================= NAVBAR GLOBAL MÍSTICA (relative z-30) ================= -->
      <header class="sticky top-0 left-0 right-0 relative z-30 bg-[#0a0a0f]/90 border-b border-amber-900/30 transition-colors duration-300 shadow-xl pointer-events-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <!-- Logotipo / Emblema -->
          <a
            routerLink="/"
            (click)="cerrarGrimorioSiAbierto()"
            class="flex items-center gap-2.5 group cursor-pointer"
          >
            <app-emblema-svg
              tipo="trebol-5"
              [size]="28"
              [glow]="true"
              class="group-hover:rotate-12 transition-transform duration-300"
            ></app-emblema-svg>
            <div class="flex flex-col">
              <span class="font-fantasy font-black text-lg tracking-widest text-amber-100 group-hover:text-amber-300 transition-colors drop-shadow">
                BLACK CLOVER
              </span>
              <span class="text-[9px] font-mono tracking-widest text-amber-500/80 uppercase -mt-1">
                Grimorio Físico 3D
              </span>
            </div>
          </a>

          <!-- Enlaces de Navegación del Encabezado -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <a
              routerLink="/"
              (click)="cerrarGrimorioSiAbierto()"
              routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-md"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-fantasy tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent cursor-pointer"
            >
              Inicio
            </a>

            <a
              routerLink="/personajes"
              (click)="cerrarGrimorioSiAbierto()"
              routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-md"
              class="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-fantasy tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent cursor-pointer"
            >
              Personajes
            </a>

            <a
              routerLink="/reinos"
              (click)="cerrarGrimorioSiAbierto()"
              routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-md"
              class="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-fantasy tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent cursor-pointer"
            >
              Reinos
            </a>

            <!-- Oculta cualquier enlace al minijuego mediante @if ligado a feature-flags -->
            @if (flags.minijuegoActivo) {
              <a
                routerLink="/misiones"
                (click)="cerrarGrimorioSiAbierto()"
                routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-md"
                class="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-fantasy tracking-wider uppercase text-rose-300 hover:text-white hover:bg-rose-950/80 transition-all border border-transparent cursor-pointer"
              >
                Misiones
              </a>
            }
          </nav>

          <!-- HUD de Estado: Estrellas Mágicas y Resonancia de Maná -->
          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-amber-500/40 shadow-inner text-amber-300 font-mono text-xs"
              title="Estrellas Mágicas disponibles"
            >
              <app-emblema-svg tipo="estrella" [size]="14" [glow]="false"></app-emblema-svg>
              <span class="font-bold">{{ estrellasTotales() }}</span>
            </div>

            <!-- Indicador reactivo de resonancia de maná -->
            <div
              class="w-3 h-3 rounded-full transition-all duration-500 animate-pulse hidden sm:block"
              [style.backgroundColor]="temaActual().colorPrimario"
              [style.boxShadow]="'0 0 12px ' + temaActual().colorBrillo"
              [title]="'Resonancia de Maná Activa: ' + temaActual().efectoEspecial"
            ></div>
          </div>
        </div>
      </header>

      <!-- ================= CONTENEDOR PRINCIPAL ================= -->
      <main class="flex-1 relative z-10 bg-transparent">
        <router-outlet />
      </main>

      <!-- ================= PIE DE PÁGINA ================= -->
      <footer class="relative z-10 py-8 border-t border-amber-900/20 bg-[#0a0a0f]/95 text-center text-xs text-slate-500 font-mono">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Black Clover Interactive Grimoire • Sistema con GSAP, tsParticles & Angular Signals</p>
          <div class="flex items-center gap-4 text-amber-400/70">
            <span>Yûki Tabata • Shueisha • Studio Pierrot</span>
          </div>
        </div>
      </footer>

      <!-- ================= OVERLAY GLOBAL DEL GRIMORIO 3D ================= -->
      <!-- Montado al nivel superior para abrirse sobre cualquier vista sin perder scroll ni recargar estado -->
      <app-grimorio-3d></app-grimorio-3d>
    </div>
  `
})
export class AppComponent {
  private readonly temaMagico = inject(TemaMagicoService);
  private readonly progresoService = inject(ProgresoJugadorService);
  private readonly grimorioState = inject(GrimorioStateService);

  readonly flags = FEATURE_FLAGS;
  readonly temaActual = this.temaMagico.temaActual;
  readonly estrellasTotales = this.progresoService.estrellasTotales;

  cerrarGrimorioSiAbierto() {
    if (this.grimorioState.estaAbierto()) {
      this.grimorioState.cerrar();
    }
  }
}
