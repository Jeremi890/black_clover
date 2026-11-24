import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

@Injectable({
  providedIn: 'root'
})
export class GsapFlipService {
  private lastCapturedState: Flip.FlipState | null = null;
  private originRect: DOMRect | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(Flip);
    }
  }

  /**
   * Captura el estado y bounding box del elemento origen (tarjeta de personaje)
   */
  capturarOrigen(elemento: HTMLElement) {
    if (!elemento) return;
    try {
      this.lastCapturedState = Flip.getState(elemento);
      this.originRect = elemento.getBoundingClientRect();
    } catch (err) {
      console.warn('Error capturando estado FLIP:', err);
    }
  }

  obtenerRectOrigen(): DOMRect | null {
    return this.originRect;
  }

  /**
   * Ejecuta la animación de entrada desde el origen hacia el contenedor destino
   */
  animarHaciaGrimorio(
    destino: HTMLElement,
    onComplete?: () => void,
    ease: string = 'power3.out'
  ) {
    if (!destino) {
      onComplete?.();
      return;
    }

    if (this.originRect) {
      const destRect = destino.getBoundingClientRect();
      const deltaX = (this.originRect.left + this.originRect.width / 2) - (destRect.left + destRect.width / 2);
      const deltaY = (this.originRect.top + this.originRect.height / 2) - (destRect.top + destRect.height / 2);
      const scaleX = this.originRect.width / destRect.width;
      const scaleY = this.originRect.height / destRect.height;

      gsap.fromTo(
        destino,
        {
          x: deltaX,
          y: deltaY,
          scaleX: Math.max(0.2, scaleX),
          scaleY: Math.max(0.2, scaleY),
          opacity: 0.3,
          rotateY: -35
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          rotateY: 0,
          duration: 0.75,
          ease: ease || 'power3.out',
          onComplete: () => {
            this.lastCapturedState = null;
            this.originRect = null;
            onComplete?.();
          }
        }
      );
    } else {
      // Entrada predeterminada con pop 3D y brillo
      gsap.fromTo(
        destino,
        {
          scale: 0.7,
          opacity: 0,
          y: 60,
          rotateX: 20
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.65,
          ease: ease || 'power3.out',
          onComplete: () => {
            onComplete?.();
          }
        }
      );
    }
  }
}
