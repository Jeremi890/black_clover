import { PerfilAnimacion, ReinoNombre } from './personaje.model';

export interface Escenario {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  imagenUrl: string;
  videoUrl?: string;
  posterUrl?: string;
}

export interface Reino {
  id: string;
  slug: string;
  nombre: ReinoNombre;
  tituloCompleto: string;
  emblemaUrl: string;
  perfilVisual: PerfilAnimacion;
  resumen: string;
  escenarios: Escenario[];
}
