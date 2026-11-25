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
   * Captura el estado DOM y bounding box del elemento origen (tarjeta clicada)
   */
  capturarOrigen(elemento: HTMLElement) {
    if (!elemento) return;
    try {
      this.lastCapturedState = Flip.getState(elemento);
      this.originRect = elemento.getBoundingClientRect();
    } catch (err) {
      console.warn('Aviso al capturar estado FLIP:', err);
    }
  }

  obtenerRectOrigen(): DOMRect | null {
    return this.originRect;
  }

  /**
   * Anima de forma fluida el destino (contenedor del grimorio) desde la posición
   * de la tarjeta capturada hacia el centro de la pantalla.
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
          scaleX: Math.max(0.15, scaleX),
          scaleY: Math.max(0.15, scaleY),
          opacity: 0.2,
          rotateY: -25
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          rotateY: 0,
          duration: 0.7,
          ease: ease || 'power3.out',
          onComplete: () => {
            this.lastCapturedState = null;
            this.originRect = null;
            onComplete?.();
          }
        }
      );
    } else {
      // Pop 3D suave si se ingresa por deep linking directo
      gsap.fromTo(
        destino,
        {
          scale: 0.7,
          opacity: 0,
          y: 50,
          rotateX: 15
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          ease: ease || 'power3.out',
          onComplete: () => {
            onComplete?.();
          }
        }
      );
    }
  }
}
