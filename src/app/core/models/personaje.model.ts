export type ReinoNombre = 'Trébol' | 'Pica' | 'Corazón' | 'Diamante';
export type EfectoEspecial = 'shake' | 'float' | 'slash' | 'ripple';
export type RolHabilidadJuego = 'ataque' | 'escudo' | 'dash' | 'definitiva';

export interface PerfilAnimacion {
  colorPrimario: string;
  colorBrillo: string;
  ease: string;
  efectoEspecial: EfectoEspecial;
}

export interface StatsHechizoJuego {
  costoEstrellas: number;   // 0 si inicia desbloqueado
  cooldownMs: number;
  rol: RolHabilidadJuego;
  potencia: number;
}

export interface StatsPersonajeJuego {
  velocidadBase: number;
  vidaMaxima: number;
  spriteSheetUrl: string;
}

export interface Hechizo {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  videoUrl: string;         // WebM (VP9) / MP4 (H.264) 4-8s
  posterUrl: string;        // Miniatura estática visible durante giro 3D
  nivelPoder: number;       // 1 a 5
  juego?: StatsHechizoJuego;
}

export interface Personaje {
  id: string;
  nombre: string;
  reino: ReinoNombre;
  escuadron: string;
  magia: string;
  hojasGrimorio: 3 | 4 | 5;
  imagenUrl: string;
  emblemaUrl: string;
  perfilVisual: PerfilAnimacion;
  biografia: string;
  hechizos: Hechizo[];
  juego?: StatsPersonajeJuego;
}

export interface ProgresoPersonaje {
  estrellas: number;
  mejorDistanciaMetros: number;
  hechizosDesbloqueados: string[];
  misionesCompletadas: string[];
}
