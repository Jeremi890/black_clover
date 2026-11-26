import { Component, inject, signal } from '@angular/core';
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
    <div class="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white bg-transparent overflow-x-hidden">
      <!-- Atmósfera Mágica: Capa de Partículas de Maná con z-index reactivo (z-0 / z-[45]) -->
      <app-particulas-mana></app-particulas-mana>

      <!-- ================= NAVBAR GLOBAL MÍSTICA (relative z-30) ================= -->
      <header class="sticky top-0 left-0 right-0 relative z-30 bg-[#0a0a0f]/90 border-b border-amber-900/30 transition-colors duration-300 shadow-xl pointer-events-auto">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <!-- Logotipo / Emblema (sin desbordamiento horizontal en 360px) -->
          <a
            routerLink="/"
            (click)="navegarYCerrarMenu()"
            class="flex items-center gap-2 group cursor-pointer min-w-0 shrink"
          >
            <app-emblema-svg
              tipo="trebol-5"
              [size]="26"
              [glow]="true"
              class="shrink-0 group-hover:rotate-12 transition-transform duration-300"
            ></app-emblema-svg>
            <div class="flex flex-col min-w-0">
              <span class="font-fantasy font-black text-base sm:text-lg tracking-wider sm:tracking-widest text-amber-100 group-hover:text-amber-300 transition-colors drop-shadow truncate">
                BLACK CLOVER
              </span>
              <span class="text-[8px] sm:text-[9px] font-mono tracking-wider sm:tracking-widest text-amber-500/80 uppercase -mt-0.5 sm:-mt-1 truncate">
                Grimorio Físico 3D
              </span>
            </div>
          </a>

          <!-- Enlaces de Navegación del Encabezado (Escritorio md+) -->
          <nav class="hidden md:flex items-center gap-1 sm:gap-2">
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

          <!-- HUD de Estado y Botón Hamburguesa -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <!-- Contador de Estrellas Mágicas -->
            <div
              class="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/70 border border-amber-500/40 shadow-inner text-amber-300 font-mono text-xs"
              title="Estrellas Mágicas disponibles"
            >
              <app-emblema-svg tipo="estrella" [size]="13" [glow]="false"></app-emblema-svg>
              <span class="font-bold text-[11px] sm:text-xs">{{ estrellasTotales() }}</span>
            </div>

            <!-- Indicador reactivo de resonancia de maná -->
            <div
              class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-500 animate-pulse hidden sm:block shrink-0"
              [style.backgroundColor]="temaActual().colorPrimario"
              [style.boxShadow]="'0 0 12px ' + temaActual().colorBrillo"
              [title]="'Resonancia de Maná Activa: ' + temaActual().efectoEspecial"
            ></div>

            <!-- Botón Hamburguesa Móvil (< md) -->
            <button
              type="button"
              (click)="toggleMenuMovil()"
              class="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-black/60 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 active:scale-95 transition-all cursor-pointer"
              aria-label="Abrir menú de navegación"
              [attr.aria-expanded]="menuMovilAbierto()"
            >
              @if (!menuMovilAbierto()) {
                <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              } @else {
                <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Panel Móvil Desplegable (< md) en z-30 -->
        @if (menuMovilAbierto()) {
          <div class="md:hidden border-t border-amber-900/30 bg-[#0a0a0f]/95 px-4 py-4 space-y-2 shadow-2xl transition-all">
            <nav class="flex flex-col gap-1.5 font-fantasy text-sm tracking-wider uppercase">
              <a
                routerLink="/"
                (click)="navegarYCerrarMenu()"
                routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40"
                [routerLinkActiveOptions]="{ exact: true }"
                class="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent flex items-center justify-between"
              >
                <span>Inicio</span>
                <span class="text-xs text-amber-400/60 font-mono">01</span>
              </a>
              <a
                routerLink="/personajes"
                (click)="navegarYCerrarMenu()"
                routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40"
                class="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent flex items-center justify-between"
              >
                <span>Personajes</span>
                <span class="text-xs text-amber-400/60 font-mono">02</span>
              </a>
              <a
                routerLink="/reinos"
                (click)="navegarYCerrarMenu()"
                routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40"
                class="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent flex items-center justify-between"
              >
                <span>Reinos</span>
                <span class="text-xs text-amber-400/60 font-mono">03</span>
              </a>
              @if (flags.minijuegoActivo) {
                <a
                  routerLink="/misiones"
                  (click)="navegarYCerrarMenu()"
                  routerLinkActive="bg-amber-950/80 text-amber-300 border-amber-500/40"
                  class="px-4 py-2.5 rounded-xl text-rose-300 hover:text-white hover:bg-rose-950/80 transition-all border border-transparent flex items-center justify-between"
                >
                  <span>Misiones</span>
                  <span class="text-xs text-rose-400/60 font-mono">04</span>
                </a>
              }
            </nav>
            <div class="pt-3 border-t border-amber-900/20 flex items-center justify-between text-xs text-amber-400/80 font-mono">
              <span class="flex items-center gap-1.5">
                <app-emblema-svg tipo="estrella" [size]="14"></app-emblema-svg>
                Estrellas: {{ estrellasTotales() }}
              </span>
              <span class="text-[10px] text-slate-400">Resonancia: {{ temaActual().efectoEspecial }}</span>
            </div>
          </div>
        }
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
  readonly menuMovilAbierto = signal<boolean>(false);

  toggleMenuMovil() {
    this.menuMovilAbierto.update(v => !v);
  }

  cerrarMenuMovil() {
    this.menuMovilAbierto.set(false);
  }

  navegarYCerrarMenu() {
    this.menuMovilAbierto.set(false);
    this.cerrarGrimorioSiAbierto();
  }

  cerrarGrimorioSiAbierto() {
    if (this.grimorioState.estaAbierto()) {
      this.grimorioState.cerrar();
    }
  }
}
