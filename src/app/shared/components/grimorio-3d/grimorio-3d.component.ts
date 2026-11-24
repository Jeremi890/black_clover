import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  inject,
  effect,
  computed,
  signal,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { gsap } from 'gsap';
import { GrimorioStateService } from '../../../core/services/grimorio-state.service';
import { TemaMagicoService } from '../../../core/services/tema-magico.service';
import { GsapFlipService } from '../../../core/services/gsap-flip.service';
import { IndicePestanasComponent } from './indice-pestanas.component';
import { PaginaHechizoComponent } from './pagina-hechizo.component';
import { EmblemaSvgComponent, TipoEmblema } from '../emblema-svg/emblema-svg.component';
import { Personaje } from '../../../core/models/personaje.model';
import { Reino } from '../../../core/models/reino.model';

@Component({
  selector: 'app-grimorio-3d',
  standalone: true,
  imports: [
    CommonModule,
    IndicePestanasComponent,
    PaginaHechizoComponent,
    EmblemaSvgComponent
  ],
  template: `
    <div
      *ngIf="abierto()"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 md:p-10 select-none overflow-hidden"
      [class.pointer-events-auto]="abierto()"
      [class.pointer-events-none]="!abierto()"
      role="dialog"
      aria-modal="true"
      aria-label="Grimorio Mágico 3D"
    >
      <!-- Fondo oscuro de invocación con blur y oscurecimiento dinámico (efecto especial de Yami/Asta) -->
      <div
        #backdrop
        (click)="cerrarGrimorio()"
        class="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-500 cursor-pointer"
        [class.bg-black]="efectoEspecial() === 'slash'"
      ></div>

      <!-- Ondas / Destello mágico de apertura según arquetipo -->
      <div
        #magicFlash
        class="absolute inset-0 pointer-events-none opacity-0 z-10"
        [style.background]="destelloAura()"
      ></div>

      <!-- ================= CONTENEDOR CENTRAL DEL GRIMORIO 3D ================= -->
      <div
        #grimoireContainer
        class="relative w-full max-w-5xl h-[85vh] max-h-[720px] min-h-[480px] z-20 perspective-2000 flex items-center justify-center"
      >
        <!-- BOTÓN DE CIERRE RÚNICO -->
        <button
          type="button"
          (click)="cerrarGrimorio()"
          class="absolute -top-10 md:-top-12 right-2 md:right-0 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-amber-500/50 text-amber-300 hover:text-white hover:border-amber-400 hover:scale-105 transition-all text-xs font-mono tracking-wider shadow-xl"
          title="Cerrar Grimorio (Esc)"
        >
          <span>CERRAR</span>
          <span class="w-4 h-4 rounded-full bg-rose-950 flex items-center justify-center text-[10px] font-bold">✕</span>
        </button>

        <!-- PESTAÑAS LATERALES FLOTANTES (Salto Rápido) -->
        <div class="hidden lg:block absolute -right-36 top-12 z-30 w-36">
          <app-indice-pestanas
            [personaje]="personajeActivo()"
            [reino]="reinoActivo()"
            [paginaActual]="paginaActual()"
            [estaAnimando]="estaAnimando()"
            (cambiarPagina)="navegarAPagina($event)"
          ></app-indice-pestanas>
        </div>

        <!-- ================= ESTRUCTURA FÍSICA DEL LIBRO 3D ================= -->
        <div
          #bookElement
          class="relative w-full h-full transform-style-3d transition-transform duration-300 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-2xl flex"
          [style.boxShadow]="'0 25px 60px -15px rgba(0,0,0,0.95), 0 0 35px -5px ' + colorPrimario() + '66'"
        >
          <!-- Lomo central metálico del libro -->
          <div class="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 z-30 pointer-events-none flex flex-col justify-between items-center py-4 bg-gradient-to-r from-neutral-900 via-amber-950/80 to-neutral-900 border-x border-amber-700/50 shadow-inner">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <div class="w-0.5 flex-1 bg-amber-500/30 my-2"></div>
            <span class="w-2 h-2 rotate-45 border border-amber-400 bg-amber-900"></span>
            <div class="w-0.5 flex-1 bg-amber-500/30 my-2"></div>
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          </div>

          <!-- ================= PÁGINA 0: PORTADA Y BIOGRAFÍA INICIAL ================= -->
          <div
            *ngIf="paginaActual() === 0"
            class="w-full h-full flex flex-col md:flex-row rounded-2xl overflow-hidden border-2 border-amber-700/60 bg-[#120d0a] shadow-2xl relative"
          >
            <!-- Portada Izquierda: Cubierta de cuero mágico, ornatos y Trébol pulsante -->
            <div
              class="w-full md:w-1/2 h-full p-8 md:p-12 flex flex-col items-center justify-between text-center relative border-b md:border-b-0 md:border-r border-amber-900/60 overflow-hidden"
              [style.background]="fondoPortada()"
            >
              <!-- Filigranas en esquinas de la portada -->
              <div class="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400"></div>
              <div class="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400"></div>
              <div class="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400"></div>
              <div class="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400"></div>

              <!-- Corona / Rango -->
              <div class="relative z-10">
                <span class="text-xs uppercase font-mono tracking-widest text-amber-400/90 border-b border-amber-500/40 pb-1">
                  {{ esPersonaje ? 'Grimorio de Magia' : 'Registro Soberano' }}
                </span>
                <h1 class="text-2xl md:text-4xl font-black text-amber-100 font-fantasy mt-2 tracking-widest drop-shadow-lg">
                  {{ tituloEntidad() }}
                </h1>
                <p class="text-xs font-serif text-amber-300/80 mt-1 italic">
                  {{ subtituloEntidad() }}
                </p>
              </div>

              <!-- Sello del Trébol Central (3, 4, 5 hojas o reino) -->
              <div class="relative my-6 group">
                <div
                  class="absolute inset-0 rounded-full blur-xl transition-all duration-700 opacity-60 group-hover:opacity-90"
                  [style.background]="colorPrimario()"
                ></div>
                <app-emblema-svg
                  [tipo]="tipoEmblema()"
                  [size]="130"
                  [glow]="true"
                  class="relative z-10 transition-transform duration-500 group-hover:scale-110"
                ></app-emblema-svg>
              </div>

              <!-- Lema / Hojas del Grimorio -->
              <div class="relative z-10 space-y-1">
                <div *ngIf="esPersonaje && personajeActivo() as p" class="flex justify-center items-center gap-1 text-amber-400 text-xs font-serif">
                  <span *ngFor="let leaf of [1,2,3,4,5]; let idx = index" [class.opacity-25]="idx >= p.hojasGrimorio">
                    🍀
                  </span>
                  <span class="ml-1 text-[11px] font-mono text-amber-300 font-bold">
                    {{ p.hojasGrimorio }} Hojas
                  </span>
                </div>
                <p class="text-[11px] text-amber-400/60 font-mono tracking-wider uppercase">
                  Reino del {{ reinoNombre() }}
                </p>
              </div>
            </div>

            <!-- Portada Derecha: Biografía profunda, afinidad mágica y botón de inicio de lectura -->
            <div class="w-full md:w-1/2 h-full p-8 md:p-10 flex flex-col justify-between bg-gradient-to-br from-[#1b1511] to-[#0c0907] relative overflow-y-auto">
              <div>
                <div class="flex items-center justify-between border-b border-amber-700/40 pb-3 mb-4">
                  <span class="text-xs font-fantasy uppercase text-amber-400 tracking-wider">
                    {{ esPersonaje ? 'Crónica del Mago' : 'Historia del Reino' }}
                  </span>
                  <span class="text-xs font-serif text-amber-500/80">Capítulo Inicial</span>
                </div>

                <h3 class="text-lg md:text-xl font-bold text-amber-200 font-fantasy mb-3">
                  {{ esPersonaje ? 'Origen y Determinación' : 'Fundamentos del Reino' }}
                </h3>

                <p class="text-sm md:text-base text-amber-100/85 leading-relaxed font-serif text-justify border-l-2 border-amber-600/60 pl-4 py-1 bg-amber-950/20 rounded-r">
                  {{ biografiaEntidad() }}
                </p>

                <!-- Tarjetas resumen de atributos -->
                <div class="mt-6 grid grid-cols-2 gap-3 text-xs">
                  <div class="p-3 bg-black/40 rounded-lg border border-amber-900/40">
                    <span class="text-[10px] text-amber-400/70 font-mono block uppercase">Tipo de Magia</span>
                    <span class="font-bold text-slate-200 text-sm">{{ magiaEntidad() }}</span>
                  </div>
                  <div class="p-3 bg-black/40 rounded-lg border border-amber-900/40">
                    <span class="text-[10px] text-amber-400/70 font-mono block uppercase">Afiliación</span>
                    <span class="font-bold text-slate-200 text-sm">{{ afiliacionEntidad() }}</span>
                  </div>
                </div>
              </div>

              <!-- Botón Comenzar a Pasar Páginas -->
              <div class="pt-6 mt-6 border-t border-amber-800/30 flex items-center justify-between">
                <span class="text-xs text-amber-400/80 font-mono">
                  Total de Páginas: {{ totalPaginas() }}
                </span>
                <button
                  type="button"
                  (click)="paginaSiguiente()"
                  [disabled]="estaAnimando()"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-fantasy tracking-wider uppercase transition-all duration-300 shadow-lg text-white"
                  [style.background]="'linear-gradient(135deg, var(--color-primario, #e11d48) 0%, #b91c1c 100%)'"
                >
                  <span>Abrir Hechizos</span>
                  <span class="text-sm">➔</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ================= PÁGINAS INTERNAS: HECHIZOS O ESCENARIOS ================= -->
          <div
            *ngIf="paginaActual() > 0"
            #turningPage
            class="w-full h-full transform-style-3d"
          >
            <!-- Hoja doble activa -->
            <app-pagina-hechizo
              [personaje]="personajeActivo()"
              [reino]="reinoActivo()"
              [hechizo]="hechizoActivo()"
              [escenario]="escenarioActivo()"
              [numeroPagina]="paginaActual()"
              [activa]="true"
              [estaAnimando]="estaAnimando()"
            ></app-pagina-hechizo>
          </div>
        </div>

        <!-- ================= BOTONES DE NAVEGACIÓN 3D FLOTANTES (< / >) ================= -->
        <button
          *ngIf="paginaActual() > 0"
          type="button"
          (click)="paginaAnterior()"
          [disabled]="estaAnimando()"
          class="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 border-2 border-amber-400/60 text-amber-300 flex items-center justify-center text-lg font-bold hover:scale-110 hover:border-amber-300 transition-all shadow-2xl backdrop-blur-sm"
          title="Página Anterior (←)"
        >
          ❮
        </button>

        <button
          *ngIf="paginaActual() < totalPaginas() - 1"
          type="button"
          (click)="paginaSiguiente()"
          [disabled]="estaAnimando()"
          class="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 border-2 border-amber-400/60 text-amber-300 flex items-center justify-center text-lg font-bold hover:scale-110 hover:border-amber-300 transition-all shadow-2xl backdrop-blur-sm"
          title="Página Siguiente (→)"
        >
          ❯
        </button>

        <!-- Indicador inferior de progreso del grimorio -->
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-amber-600/30 text-amber-300 font-mono text-[11px]">
          <span>Folio {{ paginaActual() + 1 }} / {{ totalPaginas() }}</span>
          <span class="text-slate-500">•</span>
          <span class="text-[10px] text-slate-400 hidden sm:inline">Usa flechas ← → para pasar páginas</span>
        </div>
      </div>
    </div>
  `
})
export class Grimorio3dComponent implements AfterViewInit, OnDestroy {
  private grimorioState = inject(GrimorioStateService);
  private temaMagico = inject(TemaMagicoService);
  private flipService = inject(GsapFlipService);
  private location = inject(Location);

  @ViewChild('grimoireContainer') containerRef?: ElementRef<HTMLElement>;
  @ViewChild('bookElement') bookRef?: ElementRef<HTMLElement>;
  @ViewChild('backdrop') backdropRef?: ElementRef<HTMLElement>;
  @ViewChild('magicFlash') flashRef?: ElementRef<HTMLElement>;
  @ViewChild('turningPage') turningPageRef?: ElementRef<HTMLElement>;

  readonly abierto = this.grimorioState.estaAbierto;
  readonly paginaActual = this.grimorioState.paginaActual;
  readonly estaAnimando = this.grimorioState.estaAnimando;
  readonly totalPaginas = this.grimorioState.totalPaginas;

  readonly entidad = this.grimorioState.entidadActiva;
  readonly tipo = this.grimorioState.tipoEntidad;

  readonly personajeActivo = this.grimorioState.personajeActivo;
  readonly reinoActivo = this.grimorioState.reinoActivo;

  get esPersonaje(): boolean {
    return this.tipo() === 'personaje';
  }

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

  constructor() {
    // Reacciona cuando el grimorio se abre para lanzar la física GSAP
    effect(() => {
      const isOpened = this.abierto();
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

  ngOnDestroy() {
    gsap.killTweensOf('*');
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

  /**
   * FÍSICAS GSAP SEGÚN ARQUETIPO MÁGICO:
   * - Asta: power4.inOut, shake, seco y pesado
   * - Yuno: sine.inOut, float, flotación continua
   * - Noelle: back.out(1.4), ripple, elástico y fluido
   * - Yami: expo.inOut, slash, corte seco que oscurece el fondo
   */
  private ejecutarAperturaGrimorio() {
    const container = this.containerRef?.nativeElement;
    const book = this.bookRef?.nativeElement;
    const flash = this.flashRef?.nativeElement;
    if (!container || !book) return;

    this.grimorioState.setAnimando(true);
    const tema = this.temaMagico.temaActual();
    const tl = gsap.timeline({
      onComplete: () => {
        this.grimorioState.setAnimando(false);
      }
    });

    // 1. Destello de maná inicial
    if (flash) {
      tl.fromTo(
        flash,
        { opacity: 0.8, scale: 0.7 },
        { opacity: 0, scale: 1.4, duration: 0.5, ease: 'power2.out' },
        0
      );
    }

    // 2. Transición FLIP o Pop 3D hacia el libro
    this.flipService.animarHaciaGrimorio(container, undefined, tema.ease);

    // 3. Efectos especiales por arquetipo
    if (tema.efectoEspecial === 'shake') {
      // Screen shake antimágico de Asta
      tl.to(book, {
        x: '+=8',
        yoyo: true,
        repeat: 5,
        duration: 0.05,
        ease: 'power1.inOut'
      }, 0.2);
    } else if (tema.efectoEspecial === 'float') {
      // Flotación continua de viento de Yuno
      gsap.to(book, {
        y: -10,
        repeat: -1,
        yoyo: true,
        duration: 2.2,
        ease: 'sine.inOut'
      });
    } else if (tema.efectoEspecial === 'ripple') {
      // Rebote elástico acuático de Noelle
      tl.fromTo(book, { scaleY: 0.92, scaleX: 1.05 }, { scaleY: 1, scaleX: 1, duration: 0.8, ease: 'back.out(1.5)' }, 0.2);
    } else if (tema.efectoEspecial === 'slash') {
      // Corte relámpago de Yami
      tl.fromTo(book, { rotateZ: -4, scale: 1.08 }, { rotateZ: 0, scale: 1, duration: 0.45, ease: 'expo.out' }, 0.1);
    }
  }

  /**
   * Giro de página en 3D con actualización de z-index al cruzar los -90deg
   */
  navegarAPagina(nuevaPagina: number) {
    if (this.estaAnimando() || nuevaPagina === this.paginaActual()) return;

    const book = this.bookRef?.nativeElement;
    if (!book) {
      this.grimorioState.irAPagina(nuevaPagina);
      return;
    }

    this.grimorioState.setAnimando(true);
    const tema = this.temaMagico.temaActual();
    const esHaciaAdelante = nuevaPagina > this.paginaActual();

    // Animación de giro de página 3D
    const tl = gsap.timeline({
      onComplete: () => {
        this.grimorioState.setAnimando(false);
      }
    });

    // Pequeño retroceso y salto de página 3D
    tl.to(book, {
      scale: 0.96,
      rotateY: esHaciaAdelante ? -8 : 8,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        // En el ápice de la rotación cambiamos el contenido reactivo
        this.grimorioState.irAPagina(nuevaPagina);
      }
    });

    tl.to(book, {
      scale: 1,
      rotateY: 0,
      duration: 0.4,
      ease: tema.ease || 'power3.out'
    });
  }

  paginaSiguiente() {
    if (this.paginaActual() < this.totalPaginas() - 1) {
      this.navegarAPagina(this.paginaActual() + 1);
    }
  }

  paginaAnterior() {
    if (this.paginaActual() > 0) {
      this.navegarAPagina(this.paginaActual() - 1);
    }
  }

  cerrarGrimorio() {
    if (this.estaAnimando()) return;
    const container = this.containerRef?.nativeElement;
    const backdrop = this.backdropRef?.nativeElement;

    if (container && backdrop) {
      this.grimorioState.setAnimando(true);
      gsap.to(container, {
        scale: 0.8,
        opacity: 0,
        y: 40,
        duration: 0.35,
        ease: 'power2.in'
      });
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          this.grimorioState.cerrar();
          this.grimorioState.setAnimando(false);
        }
      });
    } else {
      this.grimorioState.cerrar();
    }
  }

  // Helpers para textos y emblemas dinámicos
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
