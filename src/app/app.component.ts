import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ParticulasManaComponent } from './shared/components/particulas-mana/particulas-mana.component';
import { Grimorio3dComponent } from './shared/components/grimorio-3d/grimorio-3d.component';
import { EmblemaSvgComponent } from './shared/components/emblema-svg/emblema-svg.component';
import { TemaMagicoService } from './core/services/tema-magico.service';
import { ProgresoJugadorService } from './core/services/progreso-jugador.service';

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
    <div class="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      <!-- Partículas de Maná Ambientales reactivas al tema dinámico -->
      <app-particulas-mana></app-particulas-mana>

      <!-- ================= NAVBAR GLOBAL MÍSTICA ================= -->
      <header class="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-b border-amber-900/30 transition-all duration-500">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <!-- Logo de Black Clover -->
          <a routerLink="/" class="flex items-center gap-2.5 group">
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

          <!-- Enlaces de Navegación -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <a
              routerLink="/"
              routerLinkActive="bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-md"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-fantasy tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all border border-transparent"
            >
              Inicio
            </a>

            <a
              routerLink="/personajes"
              routerLinkActive="bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-md"
              class="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-fantasy tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all border border-transparent"
            >
              Grimorios
            </a>

            <a
              routerLink="/reinos"
              routerLinkActive="bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-md"
              class="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-fantasy tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all border border-transparent"
            >
              Reinos
            </a>
          </nav>

          <!-- HUD de Estrellas del Jugador -->
          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-amber-500/40 shadow-inner text-amber-300 font-mono text-xs"
              title="Estrellas Mágicas acumuladas para desbloquear habilidades"
            >
              <app-emblema-svg tipo="estrella" [size]="14" [glow]="false"></app-emblema-svg>
              <span class="font-bold">{{ estrellasTotales() }}</span>
            </div>

            <!-- Indicador de Resonancia de Maná -->
            <div
              class="w-3 h-3 rounded-full transition-all duration-500 animate-pulse hidden sm:block"
              [style.backgroundColor]="temaActual().colorPrimario"
              [style.boxShadow]="'0 0 10px ' + temaActual().colorBrillo"
              [title]="'Afinidad de Maná Activa: ' + temaActual().efectoEspecial"
            ></div>
          </div>
        </div>
      </header>

      <!-- ================= CONTENIDO DE VISTAS (Router Outlet) ================= -->
      <div class="flex-1 relative z-10">
        <router-outlet></router-outlet>
      </div>

      <!-- ================= PIE DE PÁGINA ================= -->
      <footer class="relative z-10 py-8 border-t border-amber-900/20 bg-black/80 text-center text-xs text-slate-500 font-mono">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Black Clover Interactive Grimoire • Sistema 3D con GSAP & Angular Signals</p>
          <div class="flex items-center gap-4 text-amber-400/70">
            <span>Yûki Tabata • Shueisha • Studio Pierrot</span>
          </div>
        </div>
      </footer>

      <!-- ================= OVERLAY GLOBAL: GRIMORIO 3D ================= -->
      <!-- Montado a nivel de shell para abrirse sobre cualquier vista sin alterar scroll ni estado -->
      <app-grimorio-3d></app-grimorio-3d>
    </div>
  `
})
export class AppComponent {
  private temaMagico = inject(TemaMagicoService);
  private progresoService = inject(ProgresoJugadorService);

  readonly temaActual = this.temaMagico.temaActual;
  readonly estrellasTotales = this.progresoService.estrellasTotales;
}
