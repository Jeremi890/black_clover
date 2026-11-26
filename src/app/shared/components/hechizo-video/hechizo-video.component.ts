import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  input,
  computed,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hechizo } from '../../../core/models/personaje.model';
import { Escenario } from '../../../core/models/reino.model';
import { GrimorioStateService } from '../../../core/services/grimorio-state.service';

@Component({
  selector: 'app-hechizo-video',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full rounded-xl overflow-hidden bg-black/80 border border-slate-700/60 shadow-2xl flex items-center justify-center group">
      <!-- Marco ornamentado mágico exterior -->
      <div
        class="absolute inset-0 pointer-events-none z-20 border-2 rounded-xl transition-all duration-700"
        [style.borderColor]="'var(--color-primario, #e11d48)'"
        style="box-shadow: inset 0 0 25px rgba(0,0,0,0.85), 0 0 15px -3px var(--border-magic, rgba(244,63,94,0.3));"
      ></div>

      <!-- Esquinas ornamentadas estilo grimorio -->
      <div class="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-amber-400/80 z-20 pointer-events-none"></div>
      <div class="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-amber-400/80 z-20 pointer-events-none"></div>
      <div class="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-amber-400/80 z-20 pointer-events-none"></div>
      <div class="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-amber-400/80 z-20 pointer-events-none"></div>

      <!-- Video Element HTML5 con doble fuente (WebM VP9 + MP4 H.264) -->
      <!-- Se renderiza ÚNICAMENTE si videoBaseUrl tiene contenido no vacío y no ha fallado la carga -->
      @if (tieneVideo()) {
        <video
          #videoPlayer
          [poster]="posterUrl()"
          loop
          muted
          playsinline
          preload="metadata"
          (loadeddata)="onVideoLoaded()"
          (error)="onVideoError()"
          class="w-full h-full object-cover relative z-10 transition-opacity duration-300"
          [class.opacity-0]="estaAnimando() || !videoCargadoOk"
          [class.opacity-100]="!estaAnimando() && videoCargadoOk"
        >
          @if (webmUrl()) {
            <source [src]="webmUrl()" type="video/webm" (error)="onWebmError()">
          }
          @if (mp4Url()) {
            <source [src]="mp4Url()" type="video/mp4" (error)="onLastSourceError()">
          }
        </video>
      }

      <!-- Poster estático y visualizador mágico visible durante giro 3D (para asegurar 60 FPS continuos) o fallback -->
      @if (estaAnimando() || !videoCargadoOk || !tieneVideo()) {
        <div
          class="absolute inset-0 z-10 bg-cover bg-center transition-all duration-500 flex flex-col justify-end p-4"
          [style.backgroundImage]="'url(' + posterUrl() + ')'"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          <!-- Canvas interactivo con animación mágica procedural si el video no existe localmente -->
          @if (!videoCargadoOk) {
            <canvas
              #magicCanvas
              class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80"
            ></canvas>
          }

          <div class="relative z-10 flex items-center justify-between text-xs text-amber-300/90 font-mono">
            <span class="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <span class="w-2 h-2 rounded-full animate-ping" [style.backgroundColor]="'var(--color-primario, #e11d48)'"></span>
              {{ subtitulo() }}
            </span>
            <span class="bg-black/60 px-2 py-0.5 rounded border border-amber-400/30 text-[10px]">
              {{ estaAnimando() ? 'Sincronizando 3D...' : (videoCargadoOk ? 'Listo' : 'Aura de Hechizo') }}
            </span>
          </div>
        </div>
      }

      <!-- Badge de nivel de poder (1 a 5) -->
      @if (hechizo(); as h) {
        <div class="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/90 px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-400 font-bold text-xs tracking-wider shadow-lg">
          <span class="text-[10px] font-mono">PODER</span>
          <div class="flex gap-0.5">
            @for (s of [1, 2, 3, 4, 5]; track s) {
              <span
                class="text-[11px]"
                [class.text-amber-400]="s <= h.nivelPoder"
                [class.text-slate-600]="s > h.nivelPoder"
              >★</span>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class HechizoVideoComponent implements AfterViewInit, OnDestroy {
  private readonly grimorioState = inject(GrimorioStateService);

  // Inputs con la nueva convención Angular Signals input<T>()
  readonly hechizo = input<Hechizo | undefined>(undefined);
  readonly escenario = input<Escenario | undefined>(undefined);
  readonly activo = input<boolean>(false);

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('magicCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly estaAnimando = this.grimorioState.estaAnimando;

  videoCargadoOk: boolean = false;
  readonly errorCargaVideo = signal<boolean>(false);
  private animFrameId: number | null = null;
  private canvasTicks: number = 0;

  readonly videoBase = computed(() => {
    return (this.hechizo()?.videoBaseUrl || this.escenario()?.videoBaseUrl || '').trim();
  });

  readonly webmUrl = computed(() => {
    const base = this.videoBase();
    return base ? `${base}.webm` : '';
  });

  readonly mp4Url = computed(() => {
    const base = this.videoBase();
    if (base) return `${base}.mp4`;
    return (this.hechizo()?.videoUrl || this.escenario()?.videoUrl || '').trim();
  });

  readonly tieneVideo = computed(() => {
    return !!this.videoBase() && !this.errorCargaVideo();
  });

  readonly posterUrl = computed(() => {
    return (
      this.hechizo()?.posterUrl ||
      this.escenario()?.posterUrl ||
      this.escenario()?.imagenUrl ||
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    );
  });

  readonly subtitulo = computed(() => {
    return this.hechizo()?.subtitulo || this.escenario()?.subtitulo || 'Maná Concentrado';
  });

  constructor() {
    // Al cambiar el hechizo o escenario activo, reiniciar el estado de error
    effect(() => {
      this.hechizo();
      this.escenario();
      this.errorCargaVideo.set(false);
      this.videoCargadoOk = false;
    });

    // Sincronización estricta por efecto:
    // Solo llama .play() cuando activo() es true y no hay giro 3D en progreso (estaAnimando() === false)
    // Cuando activo() pasa a false o se inicia una animación 3D, pausa y reinicia a currentTime = 0
    effect(() => {
      const isActivo = this.activo();
      const isAnim = this.estaAnimando();
      const video = this.videoPlayerRef?.nativeElement;

      if (video) {
        if (isActivo && !isAnim && this.videoCargadoOk && this.tieneVideo()) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Manejo seguro ante políticas de autoplay o error de decodificación
            });
          }
        } else {
          try {
            video.pause();
            video.currentTime = 0;
          } catch {
            // Silencioso
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.sincronizarReproduccion();
    this.iniciarAnimacionCanvas();
  }

  ngOnDestroy() {
    this.detenerVideo();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  onVideoLoaded() {
    this.videoCargadoOk = true;
    this.sincronizarReproduccion();
  }

  onWebmError() {
    // Si falla el WebM y no hay MP4, desmontar inmediatamente
    if (!this.mp4Url()) {
      this.onLastSourceError();
    }
  }

  onLastSourceError() {
    // Fallback seguro: si el último source falla, desmontar el elemento <video> inmediatamente
    this.videoCargadoOk = false;
    this.errorCargaVideo.set(true);
    this.iniciarAnimacionCanvas();
  }

  onVideoError() {
    // Fallback seguro: si el archivo de video local no existe en disco,
    // activa el canvas interactivo con el poster de fondo sin emitir errores no capturados
    this.videoCargadoOk = false;
    this.errorCargaVideo.set(true);
    this.iniciarAnimacionCanvas();
  }

  private sincronizarReproduccion() {
    const video = this.videoPlayerRef?.nativeElement;
    if (!video) return;

    if (this.activo() && !this.estaAnimando() && this.videoCargadoOk && this.tieneVideo()) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      this.detenerVideo();
    }
  }

  private detenerVideo() {
    const video = this.videoPlayerRef?.nativeElement;
    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // Silencioso
      }
    }
  }

  /**
   * Generador de Efectos Mágicos Procedurales en Canvas 2D
   * Crea círculos rúnicos de invocación y cortes de energía mágica a 60 FPS
   */
  private iniciarAnimacionCanvas() {
    if (typeof window === 'undefined') return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 480;
    canvas.height = 270;

    const loop = () => {
      if (!this.canvasRef?.nativeElement) return;
      this.canvasTicks++;
      const w = canvas.width;
      const h = canvas.height;

      // Desvanecimiento suave
      ctx.fillStyle = 'rgba(8, 8, 12, 0.25)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const t = this.canvasTicks * 0.03;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.5);

      // Anillo rúnico
      ctx.beginPath();
      ctx.arc(0, 0, 70 + Math.sin(t) * 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();

      // Triángulo de maná
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI) / 3;
        const x = Math.cos(ang) * 60;
        const y = Math.sin(ang) * 60;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // Ráfagas cortantes de maná
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const phase = (this.canvasTicks * 0.05 + i * 1.5) % 4;
        if (phase < 1.2) {
          ctx.beginPath();
          const startX = cx - 140 + phase * 220;
          const startY = cy + 60 - phase * 100;
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + 90, startY - 70);
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 30, 39, 0.85)' : 'rgba(56, 189, 248, 0.85)';
          ctx.lineWidth = 3 - phase * 1.5;
          ctx.shadowBlur = 15;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
        }
      }
      ctx.restore();

      this.animFrameId = requestAnimationFrame(loop);
    };

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = requestAnimationFrame(loop);
  }
}
