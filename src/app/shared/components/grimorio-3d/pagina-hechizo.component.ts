import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Personaje, Hechizo } from '../../../core/models/personaje.model';
import { Reino, Escenario } from '../../../core/models/reino.model';
import { HechizoVideoComponent } from '../hechizo-video/hechizo-video.component';
import { EmblemaSvgComponent, TipoEmblema } from '../emblema-svg/emblema-svg.component';

@Component({
  selector: 'app-pagina-hechizo',
  standalone: true,
  imports: [CommonModule, HechizoVideoComponent, EmblemaSvgComponent],
  template: `
    <article
      class="w-full h-full flex flex-col md:flex-row relative select-none overflow-hidden rounded-2xl bg-[#140f0c] shadow-2xl"
      aria-label="Página del Hechizo"
    >
      <!-- ================= PÁGINA IZQUIERDA: LORE / STATS / EMBLEMA ================= -->
      <section
        class="w-full md:w-1/2 h-full p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-900/40 relative overflow-y-auto bg-gradient-to-br from-[#1c1613] via-[#140f0c] to-[#0d0a08]"
        aria-label="Información y Lore"
      >
        <!-- Textura tenue de pergamino místico -->
        <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div class="relative z-10">
          <!-- Encabezado de página -->
          <div class="flex items-center justify-between border-b border-amber-700/30 pb-3 mb-4">
            <div class="flex items-center gap-3">
              <app-emblema-svg
                [tipo]="tipoEmblema()"
                [size]="34"
                [glow]="true"
              ></app-emblema-svg>
              <div>
                <span class="text-[10px] uppercase tracking-widest text-amber-500 font-mono">
                  {{ esPersonaje() ? (personaje()?.escuadron || 'Mago') : (reino()?.nombre || 'Reino') }}
                </span>
                <h3 class="text-sm font-bold text-amber-200 font-fantasy tracking-wider">
                  {{ esPersonaje() ? personaje()?.nombre : reino()?.tituloCompleto }}
                </h3>
              </div>
            </div>

            <!-- Folio / Número de página -->
            <span class="text-xs font-serif text-amber-400/80 border border-amber-700/40 px-2 py-0.5 rounded bg-black/40">
              {{ esPaginaCero() ? 'Folio 0 • Origen' : 'Folio ' + numeroPagina() }}
            </span>
          </div>

          <!-- Título y subtítulo del folio -->
          <div class="space-y-1 mb-4">
            <h2 class="text-xl md:text-2xl font-black text-amber-100 font-fantasy tracking-wide leading-tight drop-shadow-md">
              {{ tituloActual() }}
            </h2>
            <p class="text-xs md:text-sm font-semibold text-rose-400 tracking-wide font-serif italic">
              {{ subtituloActual() }}
            </p>
          </div>

          <!-- Descripción o Lore profundo -->
          <p class="text-xs md:text-sm text-amber-100/85 leading-relaxed font-serif text-justify border-l-2 border-amber-600/50 pl-3 py-1 my-3 bg-amber-950/20 rounded-r">
            {{ descripcionActual() }}
          </p>

          <!-- Nivel de Poder Visual (1 a 5) y Afinidad -->
          @if (esPaginaCero()) {
            <!-- Atributos generales en Página 0 -->
            <div class="mt-4 p-3 rounded-lg bg-black/40 border border-amber-800/30 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-amber-400 uppercase font-mono block">Grimorio</span>
                <span class="text-xs font-bold text-amber-200">
                  {{ esPersonaje() ? (personaje()?.hojasGrimorio + ' Hojas del Trébol') : 'Crónica Soberana' }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-amber-400 uppercase font-mono block">Afinidad Mágica</span>
                <span class="text-xs font-bold text-slate-200">
                  {{ esPersonaje() ? personaje()?.magia : 'Maná Territorial' }}
                </span>
              </div>
            </div>
          } @else if (hechizo(); as h) {
            <!-- Nivel de poder del Hechizo (1 a 5) -->
            <div class="mt-4 p-3 rounded-lg bg-black/40 border border-amber-800/30 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-amber-400 uppercase font-mono block">Nivel de Poder Mágico</span>
                <div class="flex gap-1 text-amber-400 text-sm">
                  @for (s of [1, 2, 3, 4, 5]; track s) {
                    <span [class.opacity-30]="s > h.nivelPoder">✦</span>
                  }
                  <span class="text-xs font-mono text-amber-300 ml-1">({{ h.nivelPoder }}/5)</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-amber-400 uppercase font-mono block">Atributo</span>
                <span class="text-xs font-bold text-slate-200">{{ personaje()?.magia }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Estadísticas de Combate / Videojuego (Stand-by Hooks) -->
        @if (hechizo()?.juego; as juego) {
          <div class="relative z-10 pt-4 border-t border-amber-800/30">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="font-fantasy text-amber-300 font-bold uppercase tracking-wider">Propiedades en Combate</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono">
                Rol: {{ juego.rol }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-black/50 p-2 rounded border border-amber-900/40">
                <span class="text-[10px] text-amber-400/80 block font-mono">POTENCIA</span>
                <span class="text-sm font-black text-rose-400">{{ juego.potencia }}</span>
              </div>
              <div class="bg-black/50 p-2 rounded border border-amber-900/40">
                <span class="text-[10px] text-amber-400/80 block font-mono">COOLDOWN</span>
                <span class="text-sm font-black text-cyan-400">{{ juego.cooldownMs / 1000 }}s</span>
              </div>
              <div class="bg-black/50 p-2 rounded border border-amber-900/40">
                <span class="text-[10px] text-amber-400/80 block font-mono">ESTRELLAS</span>
                <span class="text-sm font-black text-amber-300">
                  {{ juego.costoEstrellas === 0 ? 'INICIAL' : '★ ' + juego.costoEstrellas }}
                </span>
              </div>
            </div>
          </div>
        } @else if (escenario(); as esc) {
          <div class="relative z-10 pt-4 border-t border-amber-800/30">
            <div class="flex items-center justify-between text-xs text-amber-300 font-mono">
              <span>Soberanía: {{ reino()?.nombre }}</span>
              <span class="text-emerald-400">Territorio Mágico</span>
            </div>
          </div>
        }
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
              {{ esPaginaCero() ? 'Despertar del Grimorio' : (esPersonaje() ? 'Vitrina de Habilidad' : 'Vista Panorámica') }}
            </span>
            <span class="text-[10px] tracking-wider uppercase text-slate-400">60 FPS • Sincronizado</span>
          </div>

          <!-- Reproductor de Hechizo con Marco Ornamentado -->
          <div class="w-full flex-1 max-h-[360px] my-auto">
            <app-hechizo-video
              [hechizo]="hechizo()"
              [escenario]="escenario()"
              [activo]="activa()"
            ></app-hechizo-video>
          </div>

          <!-- Pie con lema místico -->
          <div class="mt-4 pt-3 border-t border-amber-900/30 flex items-center justify-between text-xs text-amber-300/80">
            <span class="font-serif italic text-amber-400">
              "{{ esPersonaje() ? '¡Supera tus límites, aquí y ahora!' : 'La historia jamás olvida el maná derramado.' }}"
            </span>
            <span class="font-mono text-[10px] text-amber-500/70">BC-3D-SYSTEM</span>
          </div>
        </div>
      </section>
    </article>
  `
})
export class PaginaHechizoComponent {
  readonly personaje = input<Personaje | null>(null);
  readonly reino = input<Reino | null>(null);
  readonly hechizo = input<Hechizo | undefined>(undefined);
  readonly escenario = input<Escenario | undefined>(undefined);
  readonly numeroPagina = input<number>(1);
  readonly activa = input<boolean>(false);

  readonly esPaginaCero = computed(() => this.numeroPagina() === 0);
  readonly esPersonaje = computed(() => !!this.personaje());

  readonly tipoEmblema = computed<TipoEmblema>(() => {
    const p = this.personaje();
    const r = this.reino();
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
  });

  readonly tituloActual = computed(() => {
    if (this.esPaginaCero()) {
      return this.personaje()?.nombre || this.reino()?.tituloCompleto || 'Registro de Poder';
    }
    return this.hechizo()?.nombre || this.escenario()?.nombre || 'Registro Mágico';
  });

  readonly subtituloActual = computed(() => {
    if (this.esPaginaCero()) {
      return this.personaje() ? `${this.personaje()?.magia} • ${this.personaje()?.escuadron}` : 'Crónica Histórica';
    }
    return this.hechizo()?.subtitulo || this.escenario()?.subtitulo || 'Conocimiento Perdido';
  });

  readonly descripcionActual = computed(() => {
    if (this.esPaginaCero()) {
      return this.personaje()?.biografia || this.reino()?.resumen || '';
    }
    return this.hechizo()?.descripcion || this.escenario()?.descripcion || '';
  });
}
