import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  inject,
  effect,
  computed,
  DestroyRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { GrimorioStateService } from '../../../core/services/grimorio-state.service';
import { TemaMagicoService } from '../../../core/services/tema-magico.service';
import { GsapFlipService } from '../../../core/services/gsap-flip.service';
import { IndicePestanasComponent } from './indice-pestanas.component';
import { PaginaHechizoComponent } from './pagina-hechizo.component';
import { EmblemaSvgComponent, TipoEmblema } from '../emblema-svg/emblema-svg.component';

@Component({
  selector: 'app-grimorio-3d',
  standalone: true,
  imports: [
    CommonModule,
    IndicePestanasComponent,
    PaginaHechizoComponent,
    EmblemaSvgComponent
  ],
  styles: [`
    :host {
      display: contents;
    }
  `],
  template: `
    @if (abierto()) {
      <!-- ================= HERMANO 1: BACKDROP OSCURO (z-40) ================= -->
      <div
        #backdrop
        (click)="cerrar()"
        class="fixed inset-0 z-40 bg-black/80 transition-opacity duration-500 cursor-pointer"
        [class.bg-black]="efectoEspecial() === 'slash'"
        aria-hidden="true"
      >
        <!-- Destello inicial de maná de invocación -->
        <div
          #magicFlash
          class="absolute inset-0 pointer-events-none opacity-0"
          [style.background]="destelloAura()"
        ></div>
      </div>

      <!-- ================= HERMANO 2: CONTENEDOR LIBRO 3D Y CONTROLES (z-50) ================= -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-2 sm:p-4 lg:p-10 select-none overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Grimorio Mágico 3D"
      >
        <!-- Contenedor central animable del libro 3D: en < lg ocupa w-[94vw] max-w-xl max-h-[90dvh] flex vertical -->
        <div
          #grimoireContainer
          class="relative w-[94vw] max-w-xl lg:w-full lg:max-w-5xl h-[88dvh] lg:h-[85vh] max-h-[88dvh] lg:max-h-[720px] lg:min-h-[480px] flex flex-col items-center justify-between pointer-events-none"
          style="perspective: 2000px;"
        >
          <!-- BOTÓN DE CIERRE RÚNICO (pointer-events-auto) -->
          <button
            type="button"
            (click)="cerrar()"
            [disabled]="estaAnimando()"
            class="absolute -top-10 right-1 sm:right-2 lg:-top-12 lg:right-0 pointer-events-auto z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#120e0c] border border-amber-500/50 text-amber-300 hover:text-white hover:border-amber-400 hover:scale-105 active:scale-95 transition-all text-xs font-mono tracking-wider shadow-xl disabled:opacity-50 cursor-pointer min-h-[36px]"
            title="Cerrar Grimorio (Esc)"
          >
            <span>CERRAR</span>
            <span class="w-4 h-4 rounded-full bg-rose-950 flex items-center justify-center text-[10px] font-bold">✕</span>
          </button>

          <!-- PESTAÑAS HORIZONTALES MÓVIL (< lg) -->
          <div class="block lg:hidden w-full z-50 pointer-events-auto mb-1.5 shrink-0 pr-20 sm:pr-0">
            <app-indice-pestanas
              [personaje]="personajeActivo()"
              [reino]="reinoActivo()"
              [paginaActual]="paginaActual()"
              [estaAnimando]="estaAnimando()"
              [modo]="'horizontal'"
              (cambiarPagina)="navegarAPagina($event)"
            ></app-indice-pestanas>
          </div>

          <!-- PESTAÑAS LATERALES FLOTANTES (ESCRITORIO >= lg) -->
          <div class="hidden lg:block absolute -right-36 top-12 z-50 w-36 pointer-events-auto">
            <app-indice-pestanas
              [personaje]="personajeActivo()"
              [reino]="reinoActivo()"
              [paginaActual]="paginaActual()"
              [estaAnimando]="estaAnimando()"
              [modo]="'vertical'"
              (cambiarPagina)="navegarAPagina($event)"
            ></app-indice-pestanas>
          </div>

          <!-- ================= ESTRUCTURA FÍSICA DEL LIBRO 3D (pointer-events-auto) ================= -->
          <div
            #bookElement
            (touchstart)="onTouchStart($event)"
            (touchend)="onTouchEnd($event)"
            class="relative w-full flex-1 min-h-0 rounded-2xl flex flex-col lg:flex-row transition-transform duration-300 z-50 pointer-events-auto overflow-hidden"
            style="transform-style: preserve-3d; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.95), 0 0 35px -5px var(--color-primario, #e11d48)66;"
          >
            <!-- Lomo central metálico del libro (sólo visible en escritorio >= lg) -->
            <div class="hidden lg:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 z-30 pointer-events-none flex-col justify-between items-center py-4 bg-gradient-to-r from-neutral-900 via-amber-950/80 to-neutral-900 border-x border-amber-700/50 shadow-inner">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <div class="w-0.5 flex-1 bg-amber-500/30 my-2"></div>
              <span class="w-2 h-2 rotate-45 border border-amber-400 bg-amber-900"></span>
              <div class="w-0.5 flex-1 bg-amber-500/30 my-2"></div>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </div>

            <!-- Hoja 3D dinámica para el giro físico de páginas en escritorio (>= lg) -->
            <div
              #turningLeaf
              class="hidden lg:block absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-0 z-30"
              style="transform-origin: left center; transform-style: preserve-3d; backface-visibility: hidden;"
            >
              <div class="w-full h-full rounded-r-2xl border-y-2 border-r-2 border-amber-600/70 bg-[#16100d] shadow-2xl flex flex-col justify-center items-center p-8 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-amber-950/30"></div>
                <div class="w-14 h-14 rounded-full border-2 border-amber-400/50 flex items-center justify-center animate-spin">
                  <span class="text-amber-400 text-xl">✦</span>
                </div>
                <span class="mt-3 text-[11px] font-fantasy uppercase tracking-widest text-amber-300/80">
                  Volteando Folio Mágico...
                </span>
              </div>
            </div>

            <!-- ================= PÁGINA 0: PORTADA Y BIOGRAFÍA INICIAL ================= -->
            @if (paginaActual() === 0) {
              <div
                class="w-full h-full flex flex-col lg:flex-row rounded-2xl overflow-y-auto lg:overflow-hidden border-2 border-amber-700/60 bg-[#120d0a] shadow-2xl relative"
              >
                <!-- Portada Izquierda / Cabecera compacta en móvil -->
                <div
                  class="w-full lg:w-1/2 p-4 sm:p-6 lg:p-12 flex flex-col items-center justify-between text-center relative border-b lg:border-b-0 lg:border-r border-amber-900/60 shrink-0 lg:shrink lg:h-full"
                  [style.background]="fondoPortada()"
                >
                  <!-- Filigranas en esquinas de la portada -->
                  <div class="absolute top-2 left-2 lg:top-3 lg:left-3 w-6 h-6 lg:w-8 lg:h-8 border-t-2 border-l-2 border-amber-400"></div>
                  <div class="absolute top-2 right-2 lg:top-3 lg:right-3 w-6 h-6 lg:w-8 lg:h-8 border-t-2 border-r-2 border-amber-400"></div>
                  <div class="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 w-6 h-6 lg:w-8 lg:h-8 border-b-2 border-l-2 border-amber-400"></div>
                  <div class="absolute bottom-2 right-2 lg:bottom-3 lg:right-3 w-6 h-6 lg:w-8 lg:h-8 border-b-2 border-r-2 border-amber-400"></div>

                  <!-- Corona / Rango -->
                  <div class="relative z-10">
                    <span class="text-[10px] lg:text-xs uppercase font-mono tracking-widest text-amber-400/90 border-b border-amber-500/40 pb-0.5 lg:pb-1">
                      {{ esPersonaje() ? 'Grimorio de Magia' : 'Registro Soberano' }}
                    </span>
                    <h1 class="text-xl sm:text-2xl lg:text-4xl font-black text-amber-100 font-fantasy mt-1.5 lg:mt-2 tracking-widest drop-shadow-lg">
                      {{ tituloEntidad() }}
                    </h1>
                    <p class="text-xs font-serif text-amber-300/80 mt-0.5 lg:mt-1 italic">
                      {{ subtituloEntidad() }}
                    </p>
                  </div>

                  <!-- Sello del Trébol Central (adaptable en tamaño) -->
                  <div class="relative my-3 lg:my-6 group">
                    <div
                      class="absolute inset-0 rounded-full blur-xl transition-all duration-700 opacity-60 group-hover:opacity-90"
                      [style.background]="colorPrimario()"
                    ></div>
                    <app-emblema-svg
                      [tipo]="tipoEmblema()"
                      [size]="emblemaSize()"
                      [glow]="true"
                      class="relative z-10 transition-transform duration-500 group-hover:scale-110"
                    ></app-emblema-svg>
                  </div>

                  <!-- Lema / Hojas del Grimorio -->
                  <div class="relative z-10 space-y-0.5 lg:space-y-1">
                    @if (esPersonaje() && personajeActivo(); as p) {
                      <div class="flex justify-center items-center gap-1 text-amber-400 text-xs font-serif">
                        @for (leaf of [1, 2, 3, 4, 5]; track leaf; let idx = $index) {
                          <span [class.opacity-25]="idx >= p.hojasGrimorio">
                            🍀
                          </span>
                        }
                        <span class="ml-1 text-[11px] font-mono text-amber-300 font-bold">
                          {{ p.hojasGrimorio }} Hojas
                        </span>
                      </div>
                    }
                    <p class="text-[10px] lg:text-[11px] text-amber-400/60 font-mono tracking-wider uppercase">
                      Reino del {{ reinoNombre() }}
                    </p>
                  </div>
                </div>

                <!-- Portada Derecha: Biografía profunda, afinidad mágica y botón de inicio de lectura -->
                <div class="w-full lg:w-1/2 p-5 sm:p-6 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-[#1b1511] to-[#0c0907] relative overflow-y-visible lg:overflow-y-auto flex-1">
                  <div>
                    <div class="flex items-center justify-between border-b border-amber-700/40 pb-2.5 mb-3 lg:pb-3 lg:mb-4">
                      <span class="text-xs font-fantasy uppercase text-amber-400 tracking-wider">
                        {{ esPersonaje() ? 'Crónica del Mago' : 'Historia del Reino' }}
                      </span>
                      <span class="text-xs font-serif text-amber-500/80">Folio 1 / {{ totalPaginas() }} • Origen</span>
                    </div>

                    <h3 class="text-base sm:text-lg lg:text-xl font-bold text-amber-200 font-fantasy mb-2 lg:mb-3">
                      {{ esPersonaje() ? 'Origen y Determinación' : 'Fundamentos del Reino' }}
                    </h3>

                    <p class="text-xs sm:text-sm lg:text-base text-amber-100/85 leading-relaxed font-serif text-justify border-l-2 border-amber-600/60 pl-3.5 py-1 bg-amber-950/20 rounded-r">
                      {{ biografiaEntidad() }}
                    </p>

                    <!-- Resumen de Atributos -->
                    <div class="mt-4 lg:mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                      <div class="p-2.5 sm:p-3 bg-black/50 rounded-lg border border-amber-900/40">
                        <span class="text-[10px] text-amber-400/70 font-mono block uppercase">Tipo de Magia</span>
                        <span class="font-bold text-slate-200 text-xs sm:text-sm">{{ magiaEntidad() }}</span>
                      </div>
                      <div class="p-2.5 sm:p-3 bg-black/50 rounded-lg border border-amber-900/40">
                        <span class="text-[10px] text-amber-400/70 font-mono block uppercase">Afiliación</span>
                        <span class="font-bold text-slate-200 text-xs sm:text-sm">{{ afiliacionEntidad() }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Botón Comenzar a Pasar Páginas -->
                  <div class="pt-4 lg:pt-6 mt-4 lg:mt-6 border-t border-amber-800/30 flex items-center justify-between gap-2">
                    <span class="text-xs text-amber-400/80 font-mono">
                      Total Folios: {{ totalPaginas() }}
                    </span>
                    <button
                      type="button"
                      (click)="paginaSiguiente()"
                      [disabled]="estaAnimando()"
                      class="flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl text-xs font-bold font-fantasy tracking-wider uppercase transition-all duration-300 shadow-lg text-white hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
                      [style.background]="'linear-gradient(135deg, var(--color-primario, #e11d48) 0%, #991b1b 100%)'"
                    >
                      <span>Abrir Hechizos</span>
                      <span class="text-sm">➔</span>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- ================= PÁGINAS INTERNAS: HECHIZOS O ESCENARIOS ================= -->
            @if (paginaActual() > 0) {
              <div class="w-full h-full" style="transform-style: preserve-3d;">
                <app-pagina-hechizo
                  [personaje]="personajeActivo()"
                  [reino]="reinoActivo()"
                  [hechizo]="hechizoActivo()"
                  [escenario]="escenarioActivo()"
                  [numeroPagina]="paginaActual()"
                  [activa]="!estaAnimando()"
                ></app-pagina-hechizo>
              </div>
            }
          </div>

          <!-- ================= BOTONES DE NAVEGACIÓN LATERALES (ESCRITORIO >= lg) ================= -->
          @if (paginaActual() > 0) {
            <button
              type="button"
              (click)="paginaAnterior()"
              [disabled]="estaAnimando()"
              class="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 pointer-events-auto z-50 w-12 h-12 rounded-full bg-[#120e0c]/90 border-2 border-amber-400/60 text-amber-300 items-center justify-center text-lg font-bold hover:scale-110 hover:border-amber-300 transition-all shadow-2xl disabled:opacity-40 cursor-pointer"
              title="Página Anterior (←)"
            >
              ❮
            </button>
          }

          @if (paginaActual() < totalPaginas() - 1) {
            <button
              type="button"
              (click)="paginaSiguiente()"
              [disabled]="estaAnimando()"
              class="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 pointer-events-auto z-50 w-12 h-12 rounded-full bg-[#120e0c]/90 border-2 border-amber-400/60 text-amber-300 items-center justify-center text-lg font-bold hover:scale-110 hover:border-amber-300 transition-all shadow-2xl disabled:opacity-40 cursor-pointer"
              title="Página Siguiente (→)"
            >
              ❯
            </button>
          }

          <!-- Indicador inferior de progreso (ESCRITORIO >= lg) -->
          <div class="hidden lg:flex absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 items-center gap-2 px-3 py-1 rounded-full bg-[#0a0a0f]/90 border border-amber-600/30 text-amber-300 font-mono text-[11px] pointer-events-none">
            <span>Folio {{ paginaActual() + 1 }} / {{ totalPaginas() }}</span>
            <span class="text-slate-500">•</span>
            <span class="text-[10px] text-slate-400">Usa flechas ❮ ❯, teclado o pestañas</span>
          </div>

          <!-- ================= BARRA INFERIOR DE NAVEGACIÓN MÓVIL (< lg) ================= -->
          <div class="flex lg:hidden w-full items-center justify-between px-3 py-2 mt-1.5 bg-[#0e0a08]/95 border border-amber-700/50 rounded-xl shadow-2xl z-50 pointer-events-auto shrink-0">
            <!-- Botón Anterior (44x44px táctil) -->
            <button
              type="button"
              (click)="paginaAnterior()"
              [disabled]="estaAnimando() || paginaActual() === 0"
              class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-black/70 border border-amber-500/40 text-amber-300 flex items-center justify-center text-lg font-bold disabled:opacity-25 active:scale-95 transition-all cursor-pointer"
              aria-label="Folio anterior"
            >
              ❮
            </button>

            <!-- Indicador de Folio y Tip de Swipe -->
            <div class="flex flex-col items-center text-center">
              <span class="text-xs font-mono font-bold text-amber-300">
                Folio {{ paginaActual() + 1 }} / {{ totalPaginas() }}
              </span>
              <span class="text-[9px] text-slate-400 font-mono">
                Desliza ⟵ ⟶ para hojear
              </span>
            </div>

            <!-- Botón Siguiente (44x44px táctil) -->
            <button
              type="button"
              (click)="paginaSiguiente()"
              [disabled]="estaAnimando() || paginaActual() >= totalPaginas() - 1"
              class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-black/70 border border-amber-500/40 text-amber-300 flex items-center justify-center text-lg font-bold disabled:opacity-25 active:scale-95 transition-all cursor-pointer"
              aria-label="Folio siguiente"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class Grimorio3dComponent implements AfterViewInit {
  private readonly grimorioState = inject(GrimorioStateService);
  private readonly temaMagico = inject(TemaMagicoService);
  private readonly flipService = inject(GsapFlipService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('grimoireContainer') containerRef?: ElementRef<HTMLElement>;
  @ViewChild('bookElement') bookRef?: ElementRef<HTMLElement>;
  @ViewChild('backdrop') backdropRef?: ElementRef<HTMLElement>;
  @ViewChild('magicFlash') flashRef?: ElementRef<HTMLElement>;
  @ViewChild('turningLeaf') turningLeafRef?: ElementRef<HTMLElement>;

  readonly abierto = this.grimorioState.estaAbierto;
  readonly paginaActual = this.grimorioState.paginaActual;
  readonly estaAnimando = this.grimorioState.estaAnimando;
  readonly totalPaginas = this.grimorioState.totalPaginas;

  readonly entidad = this.grimorioState.entidadActiva;
  readonly tipo = this.grimorioState.tipoEntidad;

  readonly personajeActivo = this.grimorioState.personajeActivo;
  readonly reinoActivo = this.grimorioState.reinoActivo;

  readonly esPersonaje = computed(() => this.tipo() === 'personaje');

  readonly colorPrimario = computed(() => {
    return this.temaMagico.temaActual().colorPrimario;
  });

  readonly efectoEspecial = computed(() => {
    return this.temaMagico.temaActual().efectoEspecial;
  });

  readonly destelloAura = computed(() => {
    const cp = this.colorPrimario();
    return `radial-gradient(circle at 50% 50%, ${cp}bb 0%, ${cp}33 50%, transparent 80%)`;
  });

  readonly fondoPortada = computed(() => {
    const cp = this.colorPrimario();
    return `radial-gradient(circle at 50% 45%, ${cp}33 0%, #150f0c 60%, #090705 100%)`;
  });

  readonly emblemaSize = computed(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 72;
    }
    return 130;
  });

  readonly hechizoActivo = computed(() => {
    const p = this.personajeActivo();
    const idx = this.paginaActual();
    if (p && idx > 0 && p.hechizos && p.hechizos[idx - 1]) {
      return p.hechizos[idx - 1];
    }
    return undefined;
  });

  readonly escenarioActivo = computed(() => {
    const r = this.reinoActivo();
    const idx = this.paginaActual();
    if (r && idx > 0 && r.escenarios && r.escenarios[idx - 1]) {
      return r.escenarios[idx - 1];
    }
    return undefined;
  });

  private ctx?: gsap.Context;
  private mm = gsap.matchMedia();
  private touchStartX = 0;
  private touchStartY = 0;
  private aperturaCompletada = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('overflow-hidden');
      }
      this.mm.revert();
      this.ctx?.revert();
      gsap.killTweensOf('*');
    });

    effect(() => {
      const isOpened = this.abierto();
      if (typeof document !== 'undefined') {
        if (isOpened) {
          document.body.classList.add('overflow-hidden');
        } else {
          document.body.classList.remove('overflow-hidden');
        }
      }
      if (isOpened) {
        setTimeout(() => this.ejecutarAperturaGrimorio(), 10);
      }
    });
  }

  ngAfterViewInit() {
    if (this.abierto()) {
      this.ejecutarAperturaGrimorio();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.abierto() && this.aperturaCompletada) {
      const book = this.bookRef?.nativeElement;
      const container = this.containerRef?.nativeElement;
      if (book) {
        gsap.set(book, { opacity: 1, scale: 1, rotateY: 0 });
      }
      if (container) {
        gsap.set(container, { opacity: 1, scale: 1 });
      }
    }
  }

  onTouchStart(event: TouchEvent) {
    if (!this.abierto()) return;
    const touch = event.changedTouches[0];
    if (touch) {
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.abierto() || this.estaAnimando()) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Umbral mínimo de 50px en el eje X y descartar si fue scroll vertical
    if (absDeltaX >= 50 && absDeltaX > absDeltaY * 1.2) {
      if (deltaX < 0) {
        // Swipe izquierda -> Siguiente folio
        this.paginaSiguiente();
      } else {
        // Swipe derecha -> Folio anterior
        this.paginaAnterior();
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.abierto()) return;
    if (event.key === 'Escape') {
      this.cerrarGrimorio();
    } else if (event.key === 'ArrowRight') {
      this.paginaSiguiente();
    } else if (event.key === 'ArrowLeft') {
      this.paginaAnterior();
    }
  }

  private ejecutarAperturaGrimorio() {
    const container = this.containerRef?.nativeElement;
    const book = this.bookRef?.nativeElement;
    const flash = this.flashRef?.nativeElement;
    if (!container || !book) return;

    this.aperturaCompletada = false;
    this.mm.revert();
    this.ctx?.revert();
    this.ctx = gsap.context(() => {
      this.grimorioState.setAnimando(true);
      const tema = this.temaMagico.temaActual();

      const tl = gsap.timeline({
        onComplete: () => {
          this.aperturaCompletada = true;
          this.grimorioState.setAnimando(false);
        }
      });

      // 1. Destello inicial de maná
      if (flash) {
        tl.fromTo(
          flash,
          { opacity: 0.8, scale: 0.7 },
          { opacity: 0, scale: 1.4, duration: 0.5, ease: 'power2.out', overwrite: 'auto' },
          0
        );
      }

      // 2. Transición hacia el grimorio
      this.flipService.animarHaciaGrimorio(container, undefined, tema.ease);

      // 3. Animación adaptativa con gsap.matchMedia()
      this.mm.add({
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 1023px)'
      }, (context) => {
        const { isDesktop } = context.conditions as { isDesktop: boolean };
        const b = this.bookRef?.nativeElement || book;
        const c = this.containerRef?.nativeElement || container;
        if (!b) return;

        // Si el grimorio ya está abierto (por ejemplo, al redimensionar la ventana cruzando breakpoints),
        // matchMedia revierte los estilos inline; forzar inmediatamente el estado visible y abierto del libro
        const yaAbierto = this.grimorioState.estaAbierto() && (this.aperturaCompletada || !this.grimorioState.estaAnimando());

        if (isDesktop) {
          if (yaAbierto) {
            gsap.set(b, { opacity: 1, scale: 1, x: 0, y: 0, rotateY: 0 });
            if (c) gsap.set(c, { opacity: 1, scale: 1, x: 0, y: 0 });
          } else {
            // Apertura 3D completa en escritorio
            tl.fromTo(
              b,
              { scale: 0.75, opacity: 0, rotateY: -15 },
              { scale: 1, opacity: 1, rotateY: 0, duration: 0.6, ease: tema.ease || 'power3.out', overwrite: 'auto' },
              0.05
            );
          }
        } else {
          if (yaAbierto) {
            gsap.set(b, { opacity: 1, scale: 1, x: 0, y: 0, rotateY: 0 });
            if (c) gsap.set(c, { opacity: 1, scale: 1, x: 0, y: 0 });
          } else {
            // Apertura optimizada sin cortes de perspectiva en móvil/tablet
            tl.fromTo(
              b,
              { scale: 0.88, opacity: 0, y: 30 },
              { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: tema.ease || 'power3.out', overwrite: 'auto' },
              0.05
            );
          }
        }
      });

      // 4. Efectos especiales por arquetipo
      if (tema.efectoEspecial === 'shake') {
        tl.to(
          book,
          {
            x: '+=8',
            yoyo: true,
            repeat: 5,
            duration: 0.05,
            ease: 'power1.inOut',
            overwrite: 'auto'
          },
          0.25
        );
      } else if (tema.efectoEspecial === 'float') {
        gsap.to(book, {
          y: -12,
          repeat: -1,
          yoyo: true,
          duration: 2.2,
          ease: 'sine.inOut',
          overwrite: 'auto'
        });
      } else if (tema.efectoEspecial === 'ripple') {
        tl.fromTo(
          book,
          { scaleY: 0.92, scaleX: 1.05 },
          { scaleY: 1, scaleX: 1, duration: 0.8, ease: 'back.out(1.4)', overwrite: 'auto' },
          0.2
        );
      } else if (tema.efectoEspecial === 'slash') {
        tl.fromTo(
          book,
          { rotateZ: -4, scale: 1.08 },
          { rotateZ: 0, scale: 1, duration: 0.45, ease: 'expo.out', overwrite: 'auto' },
          0.1
        );
      }
    }, container);
  }

  /**
   * Giro de página en 3D (escritorio >=1024px) o deslizamiento horizontal suave (móvil <1024px)
   */
  navegarAPagina(nuevaPagina: number) {
    if (this.estaAnimando() || nuevaPagina === this.paginaActual()) return;
    const max = this.totalPaginas() - 1;
    if (nuevaPagina < 0 || nuevaPagina > max) return;

    const book = this.bookRef?.nativeElement;
    const leaf = this.turningLeafRef?.nativeElement;
    if (!book) {
      this.grimorioState.forzarPagina(nuevaPagina);
      return;
    }

    const esHaciaAdelante = nuevaPagina > this.paginaActual();
    const tema = this.temaMagico.temaActual();

    // Bloqueo de entrada del usuario
    this.grimorioState.setAnimando(true);

    const esEscritorio = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

    if (esEscritorio && leaf) {
      // (min-width: 1024px): conserva exactamente la animación 3D actual (rotateY)
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(leaf, { opacity: 0, rotateY: 0, zIndex: 25 });
          // Asegura actualización final de página y libera el bloqueo
          this.grimorioState.forzarPagina(nuevaPagina);
          this.grimorioState.setAnimando(false);
        }
      });

      if (esHaciaAdelante) {
        // Giro hacia adelante: 0deg -> -90deg -> -180deg
        gsap.set(leaf, {
          opacity: 1,
          rotateY: 0,
          zIndex: 35,
          left: '50%',
          transformOrigin: 'left center'
        });

        tl.to(book, {
          scale: 0.97,
          duration: 0.22,
          ease: 'power2.in',
          overwrite: 'auto'
        }, 0);

        // Mitad de rotación: de 0deg a -90deg
        tl.to(leaf, {
          rotateY: -90,
          duration: 0.25,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(leaf, { zIndex: 45 });
            this.grimorioState.forzarPagina(nuevaPagina);
          }
        }, 0);

        // Segunda mitad: de -90deg a -180deg
        tl.to(leaf, {
          rotateY: -180,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        tl.to(book, {
          scale: 1,
          duration: 0.25,
          ease: tema.ease || 'power3.out',
          overwrite: 'auto'
        });
      } else {
        // Giro hacia atrás: -180deg -> -90deg -> 0deg
        gsap.set(leaf, {
          opacity: 1,
          rotateY: -180,
          zIndex: 45,
          left: '50%',
          transformOrigin: 'left center'
        });

        tl.to(book, {
          scale: 0.97,
          duration: 0.22,
          ease: 'power2.in',
          overwrite: 'auto'
        }, 0);

        // Mitad de rotación hacia atrás: de -180deg a -90deg
        tl.to(leaf, {
          rotateY: -90,
          duration: 0.25,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(leaf, { zIndex: 35 });
            this.grimorioState.forzarPagina(nuevaPagina);
          }
        }, 0);

        // Segunda mitad: de -90deg a 0deg
        tl.to(leaf, {
          rotateY: 0,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        tl.to(book, {
          scale: 1,
          duration: 0.25,
          ease: tema.ease || 'power3.out',
          overwrite: 'auto'
        });
      }
    } else {
      // (max-width: 1023px): usa una transición horizontal fluida (x + opacity) al cambiar de folio
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(book, { x: 0, opacity: 1 });
          this.grimorioState.forzarPagina(nuevaPagina);
          this.grimorioState.setAnimando(false);
        }
      });

      const salidaX = esHaciaAdelante ? -35 : 35;
      const entradaX = esHaciaAdelante ? 35 : -35;

      tl.to(book, {
        x: salidaX,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          this.grimorioState.forzarPagina(nuevaPagina);
          gsap.set(book, { x: entradaX, opacity: 0 });
        }
      });

      tl.to(book, {
        x: 0,
        opacity: 1,
        duration: 0.22,
        ease: tema.ease || 'power2.out',
        overwrite: 'auto'
      });
    }
  }

  paginaSiguiente() {
    if (this.estaAnimando()) return;
    const max = this.totalPaginas() - 1;
    const actual = this.paginaActual();
    if (actual < max) {
      this.navegarAPagina(actual + 1);
    }
  }

  paginaAnterior() {
    if (this.estaAnimando()) return;
    const actual = this.paginaActual();
    if (actual > 0) {
      this.navegarAPagina(actual - 1);
    }
  }

  cerrar() {
    this.cerrarGrimorio();
  }

  cerrarGrimorio() {
    if (this.estaAnimando()) return;
    this.aperturaCompletada = false;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
    const container = this.containerRef?.nativeElement;
    const backdrop = this.backdropRef?.nativeElement;

    if (container && backdrop) {
      this.grimorioState.setAnimando(true);
      const tl = gsap.timeline({
        onComplete: () => {
          this.mm.revert();
          this.ctx?.revert();
          this.grimorioState.cerrar();
          this.grimorioState.setAnimando(false);
        }
      });

      tl.to(container, {
        scale: 0.8,
        opacity: 0,
        y: 40,
        duration: 0.35,
        ease: 'power2.in',
        overwrite: 'auto'
      }, 0);

      tl.to(backdrop, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        overwrite: 'auto'
      }, 0);
    } else {
      this.mm.revert();
      this.ctx?.revert();
      this.grimorioState.cerrar();
    }
  }

  tituloEntidad(): string {
    const p = this.personajeActivo();
    const r = this.reinoActivo();
    return p?.nombre || r?.tituloCompleto || 'Grimorio';
  }

  subtituloEntidad(): string {
    const p = this.personajeActivo();
    const r = this.reinoActivo();
    return p ? `${p.magia} • ${p.escuadron}` : r?.resumen.slice(0, 80) + '...' || '';
  }

  biografiaEntidad(): string {
    const p = this.personajeActivo();
    const r = this.reinoActivo();
    return p?.biografia || r?.resumen || '';
  }

  magiaEntidad(): string {
    const p = this.personajeActivo();
    const r = this.reinoActivo();
    return p?.magia || 'Maná Continental';
  }

  afiliacionEntidad(): string {
    const p = this.personajeActivo();
    const r = this.reinoActivo();
    return p ? `${p.escuadron} (${p.reino})` : r?.nombre || '';
  }

  reinoNombre(): string {
    const p = this.personajeActivo();
    const r = this.reinoActivo();
    return p?.reino || r?.nombre || 'Trébol';
  }

  tipoEmblema(): TipoEmblema {
    const p = this.personajeActivo();
    const r = this.reinoActivo();
    if (p) {
      if (p.hojasGrimorio === 5) return 'trebol-5';
      if (p.hojasGrimorio === 4) return 'trebol-4';
      if (p.id === 'yami') return 'toro-negro';
      if (p.id === 'julius') return 'rey-mago';
      if (p.id === 'mereoleona') return 'leon-carmesi';
      return 'trebol-3';
    } else if (r) {
      if (r.nombre === 'Trébol') return 'reino-trebol';
      if (r.nombre === 'Pica') return 'reino-pica';
      if (r.nombre === 'Corazón') return 'reino-corazon';
      return 'reino-diamante';
    }
    return 'trebol-3';
  }
}
