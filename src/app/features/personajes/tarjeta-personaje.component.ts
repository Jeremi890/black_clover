import { Component, input, ElementRef, ViewChild, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Personaje } from '../../core/models/personaje.model';
import { GrimorioStateService } from '../../core/services/grimorio-state.service';
import { GsapFlipService } from '../../core/services/gsap-flip.service';
import { EmblemaSvgComponent, TipoEmblema } from '../../shared/components/emblema-svg/emblema-svg.component';
import { AuraHoverDirective } from '../../shared/directives/aura-hover.directive';

@Component({
  selector: 'app-tarjeta-personaje',
  standalone: true,
  imports: [CommonModule, EmblemaSvgComponent, AuraHoverDirective],
  template: `
    <div
      #tarjetaElement
      appAuraHover
      [escalaHover]="1.03"
      [elevacionY]="-6"
      (click)="abrirGrimorio()"
      class="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer border border-amber-900/40 bg-gradient-to-b from-[#181310] to-[#090705] shadow-xl transition-all duration-300 flex flex-col justify-between"
      [style.borderColor]="personaje().perfilVisual.colorPrimario + '55'"
    >
      <!-- Aura mágica en el borde al hacer hover con opacidad GPU -->
      <div
        class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
        [style.boxShadow]="'inset 0 0 30px ' + personaje().perfilVisual.colorPrimario + '44, 0 0 25px -5px ' + personaje().perfilVisual.colorPrimario + '66'"
      ></div>

      <!-- Imagen de fondo del caballero mágico con overlay degradado (sin backdrop-blur) -->
      <div class="absolute inset-0 z-0">
        <img
          [src]="personaje().imagenUrl"
          [alt]="personaje().nombre"
          loading="lazy"
          class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div
          class="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-300"
          [style.background]="'radial-gradient(circle at 50% 30%, ' + personaje().perfilVisual.colorPrimario + ' 0%, transparent 70%)'"
        ></div>
      </div>

      <!-- Cabecera de la tarjeta: Hojas del Trébol y Reino -->
      <div class="relative z-10 p-4 flex items-center justify-between">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 border border-amber-500/30">
          <app-emblema-svg
            [tipo]="tipoEmblema()"
            [size]="18"
            [color]="personaje().perfilVisual.colorPrimario"
            [glow]="false"
          ></app-emblema-svg>
          <span class="text-[11px] font-mono font-bold text-amber-300">
            {{ personaje().hojasGrimorio }} Hojas
          </span>
        </div>

        <span class="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-black/80 text-slate-300 border border-slate-700/60">
          {{ personaje().reino }}
        </span>
      </div>

      <!-- Pie de la tarjeta: Nombre, magia, escuadrón y botón del grimorio -->
      <div class="relative z-10 p-5 pt-0">
        <div class="flex items-center gap-2 mb-1">
          <span
            class="w-2 h-2 rounded-full"
            [style.backgroundColor]="personaje().perfilVisual.colorPrimario"
          ></span>
          <span class="text-xs font-mono uppercase tracking-widest text-amber-400">
            {{ personaje().escuadron }}
          </span>
        </div>

        <h3 class="text-2xl font-black text-white font-fantasy tracking-wide group-hover:text-amber-200 transition-colors drop-shadow">
          {{ personaje().nombre }}
        </h3>

        <p class="text-xs text-slate-300 font-serif italic mt-0.5">
          {{ personaje().magia }}
        </p>

        <!-- Indicador de Hechizos y Apertura de Grimorio -->
        <div class="mt-4 pt-3 border-t border-amber-900/40 flex items-center justify-between">
          <span class="text-[11px] text-amber-400/80 font-mono">
            {{ personaje().hechizos.length || 0 }} Hechizos
          </span>

          <span
            class="flex items-center gap-1 text-xs font-bold font-fantasy uppercase tracking-wider px-3 py-1 rounded-lg text-white shadow-lg transition-all duration-300 group-hover:scale-105"
            [style.backgroundColor]="personaje().perfilVisual.colorPrimario"
          >
            <span>Grimorio</span>
            <span class="text-sm">📖</span>
          </span>
        </div>
      </div>
    </div>
  `
})
export class TarjetaPersonajeComponent {
  private readonly grimorioState = inject(GrimorioStateService);
  private readonly flipService = inject(GsapFlipService);

  readonly personaje = input.required<Personaje>();
  @ViewChild('tarjetaElement') tarjetaRef?: ElementRef<HTMLElement>;

  readonly tipoEmblema = computed<TipoEmblema>(() => {
    const p = this.personaje();
    if (p.hojasGrimorio === 5) return 'trebol-5';
    if (p.hojasGrimorio === 4) return 'trebol-4';
    if (p.id === 'yami') return 'toro-negro';
    if (p.id === 'julius') return 'rey-mago';
    if (p.id === 'mereoleona') return 'leon-carmesi';
    return 'trebol-3';
  });

  abrirGrimorio() {
    // 1. Capturar elemento origen para la animación suave de GSAP FLIP
    if (this.tarjetaRef?.nativeElement) {
      this.flipService.capturarOrigen(this.tarjetaRef.nativeElement);
    }

    // 2. Abrir el grimorio en el store central
    this.grimorioState.abrirPersonaje(this.personaje(), 0);
  }
}
