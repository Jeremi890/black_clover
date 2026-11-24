import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  inject
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
      <div class="absolute inset-0 pointer-events-none z-20 border-2 rounded-xl transition-all duration-700"
           [style.borderColor]="'var(--color-primario, #e11d48)'"
           style="box-shadow: inset 0 0 25px rgba(0,0,0,0.85), 0 0 15px -3px var(--border-magic, rgba(244,63,94,0.3));">
      </div>

      <!-- Esquinas ornamentadas estilo grimorio -->
      <div class="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-amber-400/80 z-20 pointer-events-none"></div>
      <div class="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-amber-400/80 z-20 pointer-events-none"></div>
      <div class="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-amber-400/80 z-20 pointer-events-none"></div>
      <div class="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-amber-400/80 z-20 pointer-events-none"></div>

      <!-- Video Element -->
      <video
        #videoPlayer
        *ngIf="videoSrc"
        [src]="videoSrc"
        [poster]="posterSrc"
        loop
        muted
        playsinline
        preload="metadata"
        (loadeddata)="onVideoLoaded()"
        (error)="onVideoError()"
        class="w-full h-full object-cover relative z-10 transition-opacity duration-300"
        [class.opacity-0]="estaAnimando || !videoCargadoOk"
        [class.opacity-100]="!estaAnimando && videoCargadoOk"
      ></video>

      <!-- Miniatura / Poster estática visible durante giro 3D (para garantizar 60 FPS fijos) -->
      <div
        *ngIf="estaAnimando || !videoCargadoOk"
        class="absolute inset-0 z-10 bg-cover bg-center transition-all duration-500 flex flex-col justify-end p-4"
        [style.backgroundImage]="'url(' + posterSrc + ')'"
      >
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        <!-- Canvas interactivo con animación mágica procedural si no hay archivo de video local -->
        <canvas
          #magicCanvas
          *ngIf="!videoCargadoOk"
          class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80"
        ></canvas>

        <div class="relative z-10 flex items-center justify-between text-xs text-amber-300/90 font-mono">
          <span class="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
            <span class="w-2 h-2 rounded-full animate-ping" [style.backgroundColor]="'var(--color-primario, #e11d48)'"></span>
            {{ hechizo?.subtitulo || escenario?.subtitulo || 'Maná Concentrado' }}
          </span>
          <span class="bg-black/60 px-2 py-0.5 rounded border border-amber-400/30">
            {{ estaAnimando ? 'Sincronizando 3D...' : 'Visualizador Mágico' }}
          </span>
        </div>
      </div>

      <!-- Badge de poder / Nivel de hechizo -->
      <div *ngIf="hechizo" class="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-400 font-bold text-xs tracking-wider shadow-lg">
        <span>PODER</span>
        <div class="flex gap-0.5">
          <span
            *ngFor="let s of [1,2,3,4,5]"
            class="text-[10px]"
            [class.text-amber-400]="s <= hechizo.nivelPoder"
            [class.text-slate-600]="s > hechizo.nivelPoder"
          >★</span>
        </div>
      </div>
    </div>
  `
})
export class HechizoVideoComponent implements OnChanges, AfterViewInit, OnDestroy {
  private grimorioState = inject(GrimorioStateService);

  @Input() hechizo?: Hechizo;
  @Input() escenario?: Escenario;
  @Input() activa: boolean = false;
  @Input() estaAnimando: boolean = false;

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('magicCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  videoCargadoOk: boolean = false;
  private animFrameId: number | null = null;
  private canvasTicks: number = 0;

  get videoSrc(): string {
    return this.hechizo?.videoUrl || this.escenario?.videoUrl || '';
  }

  get posterSrc(): string {
    return (
      this.hechizo?.posterUrl ||
      this.escenario?.posterUrl ||
      this.escenario?.imagenUrl ||
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    );
  }

  ngAfterViewInit() {
    this.sincronizarReproduccion();
    this.iniciarAnimacionCanvas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activa'] || changes['estaAnimando']) {
      this.sincronizarReproduccion();
    }
  }

  ngOnDestroy() {
    this.detenerVideo();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  onVideoLoaded() {
    this.videoCargadoOk = true;
    this.sincronizarReproduccion();
  }

  onVideoError() {
    // Si el archivo de video local no existe, cae graciosamente al canvas interactivo
    this.videoCargadoOk = false;
    this.iniciarAnimacionCanvas();
  }

  /**
   * REGLA CRÍTICA DE RENDIMIENTO:
   * Solo llamar .play() si la página está activa y el giro 3D ya completó (estaAnimando = false).
   * Si la página no está activa o está en pleno giro, pausar y resetear currentTime a 0.
   */
  private sincronizarReproduccion() {
    const video = this.videoPlayerRef?.nativeElement;
    if (!video) return;

    if (this.activa && !this.estaAnimando && this.videoCargadoOk) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback silencioso por restricciones de autoplay
        });
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
      } catch (e) {
        // Ignorar excepciones al pausar
      }
    }
  }

  /**
   * Generador de Efectos Mágicos Procedurales en Canvas 2D
   * Crea ondas de maná, tajos oscuros y auras de ataque a 60 FPS
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

      // Círculo Mágico de Invocación
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

      // Triángulos de maná invertidos
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

      // Tajos o ráfagas de energía cortante
      ctx.save();
      const numSlashes = 3;
      for (let i = 0; i < numSlashes; i++) {
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
