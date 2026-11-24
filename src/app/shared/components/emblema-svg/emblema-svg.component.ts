import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TipoEmblema =
  | 'trebol-3'
  | 'trebol-4'
  | 'trebol-5'
  | 'reino-trebol'
  | 'reino-pica'
  | 'reino-corazon'
  | 'reino-diamante'
  | 'toro-negro'
  | 'amanecer-dorado'
  | 'rey-mago'
  | 'leon-carmesi'
  | 'estrella';

@Component({
  selector: 'app-emblema-svg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="inline-flex items-center justify-center transition-all duration-300"
      [style.width.px]="size"
      [style.height.px]="size"
      [class.filter]="glow"
      [style.filter]="glow ? 'drop-shadow(0 0 8px ' + colorGlow + ')' : 'none'"
    >
      <!-- TRÉBOL 3 HOJAS -->
      <svg
        *ngIf="tipo === 'trebol-3' || tipo === 'reino-trebol'"
        [attr.viewBox]="'0 0 100 100'"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <!-- Tallo -->
        <path d="M50 55 C50 78 40 92 35 94 C46 92 53 80 52 56 Z" fill="currentColor" opacity="0.9" />
        <!-- Hoja Superior -->
        <path d="M50 48 C43 35 24 22 36 12 C46 4 50 25 50 28 C50 25 54 4 64 12 C76 22 57 35 50 48 Z" fill="currentColor" />
        <!-- Hoja Izquierda -->
        <path d="M48 50 C35 43 22 24 12 36 C4 46 25 50 28 50 C25 50 4 54 12 64 C22 76 35 57 48 50 Z" fill="currentColor" />
        <!-- Hoja Derecha -->
        <path d="M52 50 C65 43 78 24 88 36 C96 46 75 50 72 50 C75 50 96 54 88 64 C78 76 65 57 52 50 Z" fill="currentColor" />
        <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.7"/>
      </svg>

      <!-- TRÉBOL 4 HOJAS (Yuno / Licht / Lemiel) -->
      <svg
        *ngIf="tipo === 'trebol-4'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <path d="M50 48 C43 35 24 22 36 12 C46 4 50 25 50 28 C50 25 54 4 64 12 C76 22 57 35 50 48 Z" fill="currentColor" />
        <path d="M48 50 C35 43 22 24 12 36 C4 46 25 50 28 50 C25 50 4 54 12 64 C22 76 35 57 48 50 Z" fill="currentColor" />
        <path d="M52 50 C65 43 78 24 88 36 C96 46 75 50 72 50 C75 50 96 54 88 64 C78 76 65 57 52 50 Z" fill="currentColor" />
        <!-- Cuarta hoja inferior -->
        <path d="M50 52 C43 65 24 78 36 88 C46 96 50 75 50 72 C50 75 54 96 64 88 C76 78 57 65 50 52 Z" fill="currentColor" />
        <!-- Núcleo de la 4ª hoja -->
        <circle cx="50" cy="50" r="6" fill="#fef08a" opacity="0.9"/>
        <circle cx="50" cy="50" r="10" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6"/>
      </svg>

      <!-- TRÉBOL 5 HOJAS (Asta / Liebe / Antimagia) -->
      <svg
        *ngIf="tipo === 'trebol-5'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <!-- Tallo demoníaco en punta de flecha -->
        <path d="M50 55 L47 88 L50 96 L53 88 Z" fill="currentColor" opacity="0.9"/>
        <!-- 4 hojas estándar oscurecidas -->
        <path d="M50 48 C43 35 24 22 36 12 C46 4 50 25 50 28 C50 25 54 4 64 12 C76 22 57 35 50 48 Z" fill="currentColor" />
        <path d="M48 50 C35 43 22 24 12 36 C4 46 25 50 28 50 C25 50 4 54 12 64 C22 76 35 57 48 50 Z" fill="currentColor" />
        <path d="M52 50 C65 43 78 24 88 36 C96 46 75 50 72 50 C75 50 96 54 88 64 C78 76 65 57 52 50 Z" fill="currentColor" />
        <path d="M50 52 C43 65 24 78 36 88 C46 96 50 75 50 72 C50 75 54 96 64 88 C76 78 57 65 50 52 Z" fill="currentColor" />
        <!-- QUINTA HOJA CENTRAL DEMONÍACA (Ojo de Demonio / Hendidura negra) -->
        <path d="M50 32 C43 45 42 55 50 68 C58 55 57 45 50 32 Z" fill="#09090b" stroke="#e11d48" stroke-width="2"/>
        <line x1="50" y1="36" x2="50" y2="64" stroke="#ff1e27" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="3" fill="#ffffff" />
      </svg>

      <!-- REINO PICA (Spade) -->
      <svg
        *ngIf="tipo === 'reino-pica'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <path d="M50 12 C35 34 16 52 16 66 C16 78 26 86 38 84 C46 82 48 76 50 72 C52 76 54 82 62 84 C74 86 84 78 84 66 C84 52 65 34 50 12 Z" fill="currentColor" />
        <path d="M46 72 L42 92 L58 92 L54 72 Z" fill="currentColor" opacity="0.9"/>
      </svg>

      <!-- REINO CORAZÓN (Heart) -->
      <svg
        *ngIf="tipo === 'reino-corazon'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <path d="M50 86 C42 78 14 58 14 36 C14 20 26 12 38 12 C44 12 48 16 50 20 C52 16 56 12 62 12 C74 12 86 20 86 36 C86 58 58 78 50 86 Z" fill="currentColor"/>
      </svg>

      <!-- REINO DIAMANTE (Diamond) -->
      <svg
        *ngIf="tipo === 'reino-diamante'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <polygon points="50,8 88,50 50,92 12,50" fill="currentColor"/>
        <polygon points="50,22 74,50 50,78 26,50" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
      </svg>

      <!-- TORO NEGRO (Cráneo de toro con cuernos y estrella) -->
      <svg
        *ngIf="tipo === 'toro-negro'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <!-- Cuernos curvados hacia arriba -->
        <path d="M30 40 C14 30 8 16 12 8 C18 18 26 28 36 32 Z" fill="currentColor"/>
        <path d="M70 40 C86 30 92 16 88 8 C82 18 74 28 64 32 Z" fill="currentColor"/>
        <!-- Cráneo central -->
        <path d="M28 34 C36 28 64 28 72 34 C76 46 72 66 64 78 L50 94 L36 78 C28 66 24 46 28 34 Z" fill="currentColor"/>
        <!-- Cuencas de ojos oscuros -->
        <circle cx="40" cy="50" r="5" fill="#09090b"/>
        <circle cx="60" cy="50" r="5" fill="#09090b"/>
        <!-- Fosas nasales -->
        <ellipse cx="46" cy="68" rx="2" ry="4" fill="#09090b"/>
        <ellipse cx="54" cy="68" rx="2" ry="4" fill="#09090b"/>
      </svg>

      <!-- AMANECER DORADO -->
      <svg
        *ngIf="tipo === 'amanecer-dorado'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <circle cx="50" cy="50" r="20" fill="currentColor"/>
        <!-- Rayos de sol -->
        <g stroke="currentColor" stroke-width="4" stroke-linecap="round">
          <line x1="50" y1="12" x2="50" y2="24"/>
          <line x1="50" y1="76" x2="50" y2="88"/>
          <line x1="12" y1="50" x2="24" y2="50"/>
          <line x1="76" y1="50" x2="88" y2="50"/>
          <line x1="23" y1="23" x2="32" y2="32"/>
          <line x1="68" y1="68" x2="77" y2="77"/>
          <line x1="23" y1="77" x2="32" y2="68"/>
          <line x1="68" y1="32" x2="77" y2="23"/>
        </g>
        <!-- Cruz interior -->
        <circle cx="50" cy="50" r="10" fill="#09090b"/>
      </svg>

      <!-- REYES LEÓN CARMESÍ -->
      <svg
        *ngIf="tipo === 'leon-carmesi'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <!-- Melena de fuego -->
        <path d="M50 10 C62 20 78 18 84 32 C88 44 86 60 76 72 C68 82 58 90 50 94 C42 90 32 82 24 72 C14 60 12 44 16 32 C22 18 38 20 50 10 Z" fill="currentColor"/>
        <!-- Cara de león interior -->
        <path d="M38 42 L50 56 L62 42 L50 36 Z" fill="#09090b"/>
        <polygon points="45,64 55,64 50,72" fill="#09090b"/>
      </svg>

      <!-- REY MAGO -->
      <svg
        *ngIf="tipo === 'rey-mago'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="4"/>
        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6,4"/>
        <!-- Agujas del reloj de tiempo de Julius -->
        <line x1="50" y1="50" x2="50" y2="22" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="72" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="6" fill="currentColor"/>
      </svg>

      <!-- ESTRELLA DE RECOMPENSA -->
      <svg
        *ngIf="tipo === 'estrella'"
        viewBox="0 0 100 100"
        class="w-full h-full"
        fill="currentColor"
        [style.color]="colorFinal"
      >
        <polygon points="50,10 62,38 92,40 68,60 76,90 50,72 24,90 32,60 8,40 38,38" fill="currentColor"/>
      </svg>
    </div>
  `
})
export class EmblemaSvgComponent {
  @Input() tipo: TipoEmblema = 'trebol-3';
  @Input() size: number = 48;
  @Input() color?: string;
  @Input() glow: boolean = true;

  get colorFinal(): string {
    return this.color || 'var(--color-primario, #e11d48)';
  }

  get colorGlow(): string {
    return this.color || 'var(--color-brillo, #fb7185)';
  }
}
