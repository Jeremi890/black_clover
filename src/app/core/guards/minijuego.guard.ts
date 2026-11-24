import { CanMatchFn } from '@angular/router';
import { FEATURE_FLAGS } from '../config/feature-flags';

export const minijuegoGuard: CanMatchFn = () => {
  if (!FEATURE_FLAGS.minijuegoActivo) {
    console.warn('[FeatureFlag] El minijuego se encuentra en stand-by (FEATURE_FLAGS.minijuegoActivo = false)');
    return false;
  }
  return true;
};
