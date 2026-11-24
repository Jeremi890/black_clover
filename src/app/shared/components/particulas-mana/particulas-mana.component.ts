import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { loadSlim } from '@tsparticles/slim';
import { Container, ISourceOptions } from '@tsparticles/engine';
import { TemaMagicoService } from '../../../core/services/tema-magico.service';

@Component({
  selector: 'app-particulas-mana',
  standalone: true,
  imports: [CommonModule, NgxParticlesModule],
  template: `
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <!-- Glow radial ambiental ligado al maná actual -->
      <div
        class="absolute inset-0 transition-all duration-1000 opacity-40"
        [style.background]="auraGradient()"
      ></div>

      <!-- tsParticles Engine Canvas -->
      <ngx-particles
        *ngIf="particlesReady()"
        [id]="particlesId"
        [options]="particlesOptions()"
        (particlesLoaded)="onParticlesLoaded($event)"
        class="w-full h-full block"
      ></ngx-particles>
    </div>
  `
})
export class ParticulasManaComponent implements OnInit {
  private particlesService = inject(NgParticlesService);
  private temaMagicoService = inject(TemaMagicoService);

  readonly particlesId = 'mana-particles-canvas';
  readonly particlesReady = signal<boolean>(false);
  private container: Container | undefined;

  readonly tema = this.temaMagicoService.temaActual;

  readonly auraGradient = computed(() => {
    const t = this.tema();
    return `radial-gradient(circle at 50% 30%, ${t.colorPrimario}22 0%, ${t.colorBrillo}08 45%, transparent 75%)`;
  });

  readonly particlesOptions = computed<ISourceOptions>(() => {
    const t = this.tema();
    const isDark = t.efectoEspecial === 'slash' || t.colorPrimario.includes('8b5cf6') || t.colorPrimario.includes('e11d48');

    return {
      fpsLimit: 60,
      fullScreen: { enable: false, zIndex: 0 },
      background: {
        color: {
          value: 'transparent'
        }
      },
      particles: {
        number: {
          value: 45,
          density: {
            enable: true,
            width: 1000,
            height: 1000
          }
        },
        color: {
          value: [t.colorPrimario, t.colorBrillo, '#ffffff', isDark ? '#1e1b4b' : '#fef08a']
        },
        shape: {
          type: 'circle'
        },
        opacity: {
          value: { min: 0.15, max: 0.75 },
          animation: {
            enable: true,
            speed: 1.2,
            sync: false
          }
        },
        size: {
          value: { min: 1.5, max: 4.5 },
          animation: {
            enable: true,
            speed: 2,
            sync: false
          }
        },
        move: {
          enable: true,
          speed: t.efectoEspecial === 'shake' ? 2.4 : t.efectoEspecial === 'float' ? 0.9 : 1.4,
          direction: 'top',
          random: true,
          straight: false,
          outModes: {
            default: 'out'
          }
        },
        links: {
          enable: true,
          distance: 120,
          color: t.colorPrimario,
          opacity: 0.18,
          width: 1
        }
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'grab'
          }
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.35,
              color: t.colorBrillo
            }
          }
        }
      },
      detectRetina: true
    };
  });

  constructor() {
    // Si cambia el tema y las partículas ya cargaron, actualizar los colores dinámicamente
    effect(() => {
      const options = this.particlesOptions();
      if (this.container) {
        try {
          const c = this.container as any;
          if (c.options?.particles?.color) {
            c.options.particles.color.value = (options.particles as any)?.color?.value;
          }
          this.container.refresh();
        } catch (e) {
          // refresco silencioso
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
      console.warn('tsParticles initialization fallback:', err);
    });
  }

  onParticlesLoaded(container: Container | undefined) {
    this.container = container;
  }
}
