# Especificación de Proyecto: Black Clover Interactive Grimoire

## 1. Visión General
Aplicación web interactiva sobre el universo de *Black Clover* (personajes, grimorios y reinos). El núcleo de la experiencia es un **grimorio físico en 3D** que se abre al hacer clic en un personaje o reino, pasando páginas de forma interactiva:
- **Estilo vitrina de habilidades de videojuego:** cada página de hechizo muestra información/lore en la página izquierda y un clip corto de video del ataque en la página derecha.
- **Identidad única por personaje:** colores, auras, partículas de maná y curvas de aceleración (`ease`) de GSAP cambian dinámicamente según el mago o reino seleccionado.
- **Preparado para escalar (Stand-by):** la arquitectura deja ganchos tipados y un *Feature Flag* apagado para agregar en el futuro un minijuego runner estilo *Postknight* / *Dino* con sistema de Estrellas (moneda por misiones y metros recorridos) para desbloquear habilidades, sin refactorizar el proyecto actual.

---

## 2. Stack Tecnológico y Restricciones
- **Framework:** Angular (Standalone Components, Signals, `withViewTransitions()`, `withComponentInputBinding()`, **SSR desactivado**).
- **Estilos:** Tailwind CSS v4 (`@tailwindcss/postcss`) consumiendo variables CSS dinámicas (`--color-primario`, `--color-brillo`).
- **Animaciones:** GSAP (`gsap.timeline()`, `Flip` plugin) combinado con CSS 3D (`perspective`, `transform-style: preserve-3d`, `backface-visibility: hidden`).
- **Partículas:** `@tsparticles/angular` + `@tsparticles/slim` (partículas de maná reactivas al tema).
- **Fuente de datos:** Archivos JSON estáticos locales en `public/data/` (sin dependencia de APIs externas de anime).
- **Gráficos vectoriales:** SVGs en línea para emblemas de reinos, tréboles (3, 4 y 5 hojas) y escuadrones, permitiendo animación de trazos y `drop-shadow` dinámico.

---

## 3. Fases de Desarrollo

### FASE 1: Capa Core, Modelos, Datos y Rutas
- Modelos estrictos en `src/app/core/models/` (`personaje.model.ts` y `reino.model.ts`). En `Hechizo`, `videoBaseUrl` (ruta sin extensión para soportar `.webm` y `.mp4`) y `posterUrl`. Bloques `juego?:` opcionales.
- Datos locales en `public/data/personajes.json` (Asta, Yuno, Noelle, Yami con 3 hechizos cada uno y perfiles GSAP) y `public/data/reinos.json` (Trébol, Pica, Corazón, Diamante con 2 escenarios cada uno).
- Servicios basados exclusivamente en Angular Signals (sin BehaviorSubject):
  - `DatosCloverService`: Carga de JSONs vía `HttpClient` + `toSignal()` + `computed()` para filtros.
  - `GrimorioStateService`: Signals de lectura pública para entidad activa, estado abierto/cerrado, página actual y bloqueo `estaAnimando`.
  - `TemaMagicoService`: Inyección de variables CSS `--color-primario` y `--color-brillo` mediante `effect()`.
  - `ProgresoJugadorService`: Estado de stand-by conectado a `localStorage` para estrellas, metros y hechizos desbloqueados.
- Feature Flag `FEATURE_FLAGS.minijuegoActivo = false` con `minijuegoGuard` y rutas configuradas con lazy loading.
