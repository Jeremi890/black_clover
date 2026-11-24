export interface FeatureFlags {
  minijuegoActivo: boolean;
  sonidosMagicos: boolean;
  modoDepuracion3D: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  minijuegoActivo: false, // Stand-by: futuro minijuego runner estilo Postknight / Dino (0 KB en bundle)
  sonidosMagicos: true,
  modoDepuracion3D: false
};
