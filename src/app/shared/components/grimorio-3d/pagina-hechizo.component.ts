import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Personaje, Hechizo } from '../../../core/models/personaje.model';
import { Reino, Escenario } from '../../../core/models/reino.model';
import { HechizoVideoComponent } from '../hechizo-video/hechizo-video.component';
import { EmblemaSvgComponent, TipoEmblema } from '../emblema-svg/emblema-svg.component';
import { ProgresoJugadorService } from '../../../core/services/progreso-jugador.service';

@Component({
  selector: 'app-pagina-hechizo',
  standalone: true,
  imports: [CommonModule, HechizoVideoComponent, EmblemaSvgComponent],
  template: `
    <article
      class="w-full h-full flex flex-col md:flex-row relative select-none overflow-hidden rounded-2xl bg-amber-950/20 backdrop-blur-md"
      aria-label="Página del Hechizo"
    >
      <!-- ================= PÁGINA IZQUIERDA: LORE / STATS / EMBLEMA ================= -->
      <section
        class="w-full md:w-1/2 h-full p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-900/40 relative overflow-y-auto bg-gradient-to-br from-[#1c1613] via-[#140f0c] to-[#0d0a08]"
        aria-label="Información del Hechizo"
      >
        <!-- Textura de pergamino místico tenue -->
        <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <!-- Encabezado de Página -->
        <div class="relative z-10">
          <div class="flex items-center justify-between border-b border-amber-700/30 pb-3 mb-4">
            <div class="flex items-center gap-3">
              <app-emblema-svg
                [tipo]="tipoEmblema"
                [size]="34"
                [glow]="true"
              ></app-emblema-svg>
              <div>
                <span class="text-[10px] uppercase tracking-widest text-amber-500 font-mono">
                  {{ esPersonaje ? personaje?.escuadron : reino?.nombre }}
                </span>
                <h3 class="text-sm font-bold text-amber-200 font-fantasy tracking-wider">
                  {{ esPersonaje ? personaje?.nombre : reino?.tituloCompleto }}
                </h3>
              </div>
            </div>

            <!-- Número de Hoja / Paginación Romana -->
            <span class="text-xs font-serif text-amber-400/70 border border-amber-700/40 px-2 py-0.5 rounded bg-black/40">
              Folio {{ numeroPagina }}
            </span>
          </div>

          <!-- Título del Hechizo / Escenario -->
          <div class="space-y-1 mb-4">
            <h2 class="text-xl md:text-2xl font-black text-amber-100 font-fantasy tracking-wide leading-tight drop-shadow-md">
              {{ tituloActual }}
            </h2>
            <p class="text-xs md:text-sm font-semibold text-rose-400 tracking-wide font-serif italic">
              {{ subtituloActual }}
            </p>
          </div>

          <!-- Descripción / Lore profundo -->
          <p class="text-xs md:text-sm text-amber-100/80 leading-relaxed font-serif text-justify border-l-2 border-amber-600/50 pl-3 py-1 my-3 bg-amber-950/20 rounded-r">
            {{ descripcionActual }}
          </p>

          <!-- Nivel de Poder y Atributo Mágico -->
          <div *ngIf="hechizo" class="mt-4 p-3 rounded-lg bg-black/40 border border-amber-800/30 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-amber-400 uppercase font-mono block">Nivel de Maestría</span>
              <div class="flex gap-1 text-amber-400 text-sm">
                <span *ngFor="let s of [1,2,3,4,5]" [class.opacity-30]="s > hechizo.nivelPoder">✦</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-amber-400 uppercase font-mono block">Afinidad</span>
              <span class="text-xs font-bold text-slate-200">{{ personaje?.magia }}</span>
            </div>
          </div>
        </div>

        <!-- Estadísticas de Combate / Videojuego (Stand-by Hooks) -->
        <div *ngIf="hechizo?.juego" class="relative z-10 pt-4 border-t border-amber-800/30">
          <div class="flex items-center justify-between text-xs mb-2">
            <span class="font-fantasy text-amber-300 font-bold uppercase tracking-wider">Propiedades en Combate</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono">
              Rol: {{ hechizo?.juego?.rol }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-black/50 p-2 rounded border border-amber-900/40">
              <span class="text-[10px] text-amber-400/80 block font-mono">POTENCIA</span>
              <span class="text-sm font-black text-rose-400">{{ hechizo?.juego?.potencia }}</span>
            </div>
            <div class="bg-black/50 p-2 rounded border border-amber-900/40">
              <span class="text-[10px] text-amber-400/80 block font-mono">COOLDOWN</span>
              <span class="text-sm font-black text-cyan-400">{{ (hechizo?.juego?.cooldownMs || 0) / 1000 }}s</span>
            </div>
            <div class="bg-black/50 p-2 rounded border border-amber-900/40">
              <span class="text-[10px] text-amber-400/80 block font-mono">ESTRELLAS</span>
              <span class="text-sm font-black text-amber-300">
                {{ hechizo?.juego?.costoEstrellas === 0 ? 'DESBLOQUEADO' : '★ ' + hechizo?.juego?.costoEstrellas }}
              </span>
            </div>
          </div>
        </div>

        <!-- Lore de Reino Escenario (si no es personaje) -->
        <div *ngIf="escenario" class="relative z-10 pt-4 border-t border-amber-800/30">
          <div class="flex items-center justify-between text-xs text-amber-300 font-mono">
            <span>Soberanía: {{ reino?.nombre }}</span>
            <span class="text-emerald-400">Territorio Seguro</span>
          </div>
        </div>
      </section>

      <!-- ================= PÁGINA DERECHA: REPRODUCTOR MÁGICO / CLIP ================= -->
      <section
        class="w-full md:w-1/2 h-full p-6 md:p-8 flex flex-col justify-between relative bg-gradient-to-bl from-[#181310] via-[#100d0a] to-[#090705]"
        aria-label="Demostración Mágica"
      >
        <!-- Textura mágica de fondo -->
        <div class="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,var(--color-primario)_0%,transparent_70%)]"></div>

        <div class="relative z-10 flex flex-col h-full justify-between">
          <!-- Etiqueta superior del reproductor -->
          <div class="flex items-center justify-between mb-3 text-xs text-amber-400/80 font-mono">
            <span class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {{ esPersonaje ? 'Vitrina de Habilidad' : 'Vista Panorámica del Reino' }}
            </span>
            <span class="text-[10px] tracking-wider uppercase text-slate-400">60 FPS • Sincronizado</span>
          </div>

          <!-- Reproductor de Hechizo con Marco Ornamentado -->
          <div class="w-full flex-1 max-h-[360px] my-auto">
            <app-hechizo-video
              [hechizo]="hechizo"
              [escenario]="escenario"
              [activa]="activa"
              [estaAnimando]="estaAnimando"
            ></app-hechizo-video>
          </div>

          <!-- Pie con resumen místico -->
          <div class="mt-4 pt-3 border-t border-amber-900/30 flex items-center justify-between text-xs text-amber-300/80">
            <span class="font-serif italic text-amber-400">
              "{{ esPersonaje ? '¡Supera tus límites, aquí y ahora!' : 'La historia jamás olvida el maná derramado.' }}"
            </span>
            <span class="font-mono text-[10px] text-amber-500/70">BC-3D-SYSTEM</span>
          </div>
        </div>
      </section>
    </article>
  `
})
export class PaginaHechizoComponent {
  @Input() personaje?: Personaje | null;
  @Input() reino?: Reino | null;
  @Input() hechizo?: Hechizo;
  @Input() escenario?: Escenario;
  @Input() numeroPagina: number = 1;
  @Input() activa: boolean = false;
  @Input() estaAnimando: boolean = false;

  get esPersonaje(): boolean {
    return !!this.personaje;
  }

  get tipoEmblema(): TipoEmblema {
    if (this.esPersonaje && this.personaje) {
      if (this.personaje.hojasGrimorio === 5) return 'trebol-5';
      if (this.personaje.hojasGrimorio === 4) return 'trebol-4';
      if (this.personaje.id === 'yami') return 'toro-negro';
      if (this.personaje.id === 'julius') return 'rey-mago';
      if (this.personaje.id === 'mereoleona') return 'leon-carmesi';
      return 'trebol-3';
    } else if (this.reino) {
      if (this.reino.nombre === 'Trébol') return 'reino-trebol';
      if (this.reino.nombre === 'Pica') return 'reino-pica';
      if (this.reino.nombre === 'Corazón') return 'reino-corazon';
      return 'reino-diamante';
    }
    return 'trebol-3';
  }

  get tituloActual(): string {
    return this.hechizo?.nombre || this.escenario?.nombre || 'Registro Mágico';
  }

  get subtituloActual(): string {
    return this.hechizo?.subtitulo || this.escenario?.subtitulo || 'Conocimiento Perdido';
  }

  get descripcionActual(): string {
    return this.hechizo?.descripcion || this.escenario?.descripcion || '';
  }
}
