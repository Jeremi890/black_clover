import { Directive, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';

@Directive({
  selector: '[appAuraHover]',
  standalone: true
})
export class AuraHoverDirective implements OnDestroy {
  private readonly el = inject(ElementRef);

  @Input() escalaHover: number = 1.03;
  @Input() elevacionY: number = -6;

  private soportaHover(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(hover: hover)').matches;
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.soportaHover()) return;
    // Anima únicamente propiedades GPU (transform: scale, y) con overwrite: 'auto'
    // sin alterar box-shadow ni filter: blur por GSAP
    gsap.to(this.el.nativeElement, {
      scale: this.escalaHover,
      y: this.elevacionY,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (!this.soportaHover()) return;
    gsap.to(this.el.nativeElement, {
      scale: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  ngOnDestroy() {
    gsap.killTweensOf(this.el.nativeElement);
  }
}
