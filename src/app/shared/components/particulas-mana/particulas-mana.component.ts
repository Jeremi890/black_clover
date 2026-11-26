import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { loadSlim } from '@tsparticles/slim';
import { Container, ISourceOptions } from '@tsparticles/engine';
import { TemaMagicoService } from '../../../core/services/tema-magico.service';
import { GrimorioStateService } from '../../../core/services/grimorio-state.service';

@Component({
  selector: 'app-particulas-mana',
  standalone: true,
  imports: [CommonModule, NgxParticlesModule],
  styles: [`
    :host {
      display: contents;
      pointer-events: none !important;
    }
  `],
  template: `
    <!-- Contenedor fijo de partículas con z-index reactivo: z-0 cuando cerrado, z-[45] cuando el grimorio está abierto -->
    <div
      class="fixed inset-0 pointer-events-none overflow-hidden bg-transparent transition-all duration-500"
      [class.z-0]="!estaAbierto()"
      [class.z-\[45\]]="estaAbierto()"
    >
      <!-- Glow radial ambiental suave -->
      <div
        class="absolute inset-0 transition-opacity duration-700 pointer-events-none bg-transparent"
        [class.opacity-25]="!estaAbierto()"
        [class.opacity-40]="estaAbierto()"
        [style.background]="auraGradient()"
      ></div>

      <!-- Canvas de partículas de maná optimizado a 60 FPS sin links ni interactividad pesada -->
      @if (particlesReady()) {
        <ngx-particles
          [id]="particlesId"
          [options]="particlesOptions()"
          (particlesLoaded)="onParticlesLoaded($event)"
          class="w-full h-full block bg-transparent pointer-events-none"
        ></ngx-particles>
      }
    </div>
  `
})
export class ParticulasManaComponent implements OnInit {
  private readonly particlesService = inject(NgParticlesService);
  private readonly temaMagicoService = inject(TemaMagicoService);
  private readonly grimorioState = inject(GrimorioStateService);

  readonly particlesId = 'mana-particles-canvas';
  readonly particlesReady = signal<boolean>(false);
  private container: Container | undefined;
  private lastColor: string = '';

  readonly estaAbierto = this.grimorioState.estaAbierto;
  readonly tema = this.temaMagicoService.temaActual;

  readonly auraGradient = computed(() => {
    const t = this.tema();
    return `radial-gradient(circle at 50% 35%, ${t.colorPrimario}20 0%, ${t.colorBrillo}08 50%, transparent 80%)`;
  });

  // Opciones ligeras de alto rendimiento (60 FPS fijos, 0 link checks, 0 eventos de hover)
  readonly particlesOptions = computed<ISourceOptions>(() => {
    const t = this.tema();
    const esMovil = typeof window !== 'undefined' && window.innerWidth < 768;
    const cantidadParticulas = esMovil ? 18 : 36;

    return {
      fpsLimit: 60,
      detectRetina: false, // Evita sobrecarga de resolución en pantallas Retina
      fullScreen: { enable: false },
      background: {
        color: { value: 'transparent' },
        opacity: 0
      },
      particles: {
        number: {
          value: cantidadParticulas // 18 en móvil (<768px), 36 en escritorio para máximo rendimiento
        },
        color: {
          value: [t.colorPrimario, t.colorBrillo, '#ffffff']
        },
        shape: {
          type: 'circle'
        },
        opacity: {
          value: { min: 0.45, max: 0.85 } // Visibles y brillantes
        },
        size: {
          value: { min: 2, max: 4.5 } // Tamaño nítido entre 2 y 4.5px
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: 'top',
          random: true,
          straight: false,
          outModes: {
            default: 'out'
          }
        },
        links: {
          enable: false // Desactivado para eliminar cálculo masivo de distancias por frame
        },
        collisions: {
          enable: false // Desactivado para evitar cálculos de física innecesarios
        }
      },
      interactivity: {
        events: {
          onHover: { enable: false }, // Sin listeners en el scroll/mouse
          onClick: { enable: false }
        }
      }
    };
  });

  constructor() {
    // Sincronización limpia de color sin recrear instancias de canvas en bucle
    effect(() => {
      const tema = this.temaMagicoService.temaActual();
      const nuevoColor = tema.colorPrimario;

      if (this.container && nuevoColor && nuevoColor !== this.lastColor) {
        this.lastColor = nuevoColor;
        try {
          const c = this.container as any;
          const nuevosColores = [tema.colorPrimario, tema.colorBrillo, '#ffffff'];

          if (c.options?.particles?.color) {
            c.options.particles.color.value = nuevosColores;
          }

          // Actualiza partículas vivas sin forzar re-renderizado destructivo
          if (c.particles?.array) {
            for (let i = 0; i < c.particles.array.length; i++) {
              const p = c.particles.array[i];
              if (p.color) {
                p.color.value = nuevosColores[i % nuevosColores.length];
              }
            }
          }
        } catch {
          // Silencioso
        }
      }
    });
  }

  ngOnInit() {
    this.particlesService.init(async engine => {
      await loadSlim(engine);
    }).then(() => {
      this.particlesReady.set(true);
    }).catch(err => {
      console.warn('Inicialización de tsParticles:', err);
    });
  }

  onParticlesLoaded(container: Container | undefined) {
    this.container = container;
    if (container) {
      this.lastColor = this.tema().colorPrimario;
    }
  }
}
