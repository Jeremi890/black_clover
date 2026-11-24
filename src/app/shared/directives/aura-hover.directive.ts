import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { gsap } from 'gsap';

@Directive({
  selector: '[appAuraHover]',
  standalone: true
})
export class AuraHoverDirective {
  private el = inject(ElementRef);

  @Input() escalaHover: number = 1.04;
  @Input() elevacionY: number = -6;
  @Input() intensificarBrillo: boolean = true;

  @HostListener('mouseenter')
  onMouseEnter() {
    gsap.to(this.el.nativeElement, {
      scale: this.escalaHover,
      y: this.elevacionY,
      duration: 0.35,
      ease: 'power2.out',
      boxShadow: this.intensificarBrillo
        ? '0 12px 30px -5px var(--aura-glow, rgba(225, 29, 72, 0.45)), 0 0 15px 0 var(--border-magic, rgba(244, 63, 94, 0.3))'
        : '0 10px 20px -5px rgba(0, 0, 0, 0.5)'
    });
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    gsap.to(this.el.nativeElement, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: 'power3.out',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
    });
  }
}
