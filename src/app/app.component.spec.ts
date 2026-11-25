import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { GrimorioStateService } from './core/services/grimorio-state.service';
import { ProgresoJugadorService } from './core/services/progreso-jugador.service';
import { TemaMagicoService } from './core/services/tema-magico.service';
import { FEATURE_FLAGS } from './core/config/feature-flags';
import { minijuegoGuard } from './core/guards/minijuego.guard';
import { HechizoVideoComponent } from './shared/components/hechizo-video/hechizo-video.component';
import { PaginaHechizoComponent } from './shared/components/grimorio-3d/pagina-hechizo.component';
import { IndicePestanasComponent } from './shared/components/grimorio-3d/indice-pestanas.component';
import { Grimorio3dComponent } from './shared/components/grimorio-3d/grimorio-3d.component';
import { TarjetaPersonajeComponent } from './features/personajes/tarjeta-personaje.component';
import { GaleriaPersonajesComponent } from './features/personajes/galeria-personajes.component';
import { MapaReinosComponent } from './features/reinos/mapa-reinos.component';
import { VistaReinoComponent } from './features/reinos/vista-reino.component';
import { Personaje } from './core/models/personaje.model';
import { Reino } from './core/models/reino.model';

const MOCK_ASTA: Personaje = {
  id: 'asta',
  nombre: 'Asta',
  reino: 'Trébol',
  escuadron: 'Toro Negro',
  magia: 'Antimagia',
  hojasGrimorio: 5,
  imagenUrl: 'https://images.unsplash.com/photo-asta',
  emblemaUrl: 'assets/emblemas/toro-negro.svg',
  perfilVisual: {
    colorPrimario: '#e11d48',
    colorBrillo: '#0f172a',
    ease: 'power4.inOut',
    efectoEspecial: 'shake'
  },
  biografia: 'Un joven huérfano sin magia...',
  hechizos: [
    {
      id: 'asta-danma',
      nombre: 'Espada Danma: Tajo de Antimagia',
      subtitulo: 'Espada Asesina de Demonios',
      descripcion: 'Invoca la enorme espada...',
      videoBaseUrl: 'assets/videos/asta-danma',
      posterUrl: 'https://images.unsplash.com/photo-danma',
      nivelPoder: 4,
      juego: {
        costoEstrellas: 0,
        cooldownMs: 3000,
        rol: 'ataque',
        potencia: 85
      }
    }
  ]
};

const MOCK_REINO_TREBOL: Reino = {
  id: 'reino-trebol',
  slug: 'trebol',
  nombre: 'Trébol',
  tituloCompleto: 'Reino del Trébol',
  emblemaUrl: 'assets/emblemas/reino-trebol.svg',
  perfilVisual: {
    colorPrimario: '#10b981',
    colorBrillo: '#34d399',
    ease: 'sine.inOut',
    efectoEspecial: 'float'
  },
  resumen: 'El reino donde la magia define tu estatus social...',
  escenarios: [
    {
      id: 'capital-real',
      nombre: 'Capital Real de Clover',
      subtitulo: 'Sede de los Reyes Magos',
      descripcion: 'Corazón del Reino del Trébol.',
      imagenUrl: 'https://images.unsplash.com/photo-clover'
    }
  ]
};

describe('Black Clover Interactive Grimoire Suite - Fase 4 (MVP)', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TarjetaPersonajeComponent,
        GaleriaPersonajesComponent,
        MapaReinosComponent,
        VistaReinoComponent,
        Grimorio3dComponent,
        HechizoVideoComponent,
        PaginaHechizoComponent,
        IndicePestanasComponent
      ],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('debe inicializar AppComponent como shell inmersivo limpio sin botones temporales', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-grimorio-3d')).toBeTruthy();
  });

  it('debe mantener el minijuego completamente aislado con FEATURE_FLAGS.minijuegoActivo = false', () => {
    expect(FEATURE_FLAGS.minijuegoActivo).toBe(false);
    const match = (minijuegoGuard as any)({} as any, [], {} as any);
    expect(match).toBe(false);
  });

  it('TarjetaPersonajeComponent debe capturar origen FLIP y abrir el grimorio', () => {
    const fixture = TestBed.createComponent(TarjetaPersonajeComponent);
    fixture.componentRef.setInput('personaje', MOCK_ASTA);
    fixture.detectChanges();

    const state = TestBed.inject(GrimorioStateService);
    expect(state.estaAbierto()).toBe(false);

    fixture.componentInstance.abrirGrimorio();
    expect(state.estaAbierto()).toBe(true);
    expect(state.personajeActivo()?.id).toBe('asta');
  });

  it('GaleriaPersonajesComponent debe conectar filtros y gestionar deep linking', () => {
    const fixture = TestBed.createComponent(GaleriaPersonajesComponent);
    fixture.componentRef.setInput('id', 'asta');
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.id()).toBe('asta');
    expect(comp.busqueda()).toBe('');

    comp.busqueda.set('Asta');
    expect(comp.busqueda()).toBe('Asta');

    comp.restablecerFiltros();
    expect(comp.busqueda()).toBe('');
    expect(comp.filtroReino()).toBe('todos');
  });

  it('MapaReinosComponent debe previsualizar la atmósfera del reino en hover y abrir crónica', () => {
    const fixture = TestBed.createComponent(MapaReinosComponent);
    fixture.detectChanges();

    const temaService = TestBed.inject(TemaMagicoService);
    const state = TestBed.inject(GrimorioStateService);

    // Previsualizar atmósfera en hover
    fixture.componentInstance.previsualizarAtmosfera(MOCK_REINO_TREBOL);
    expect(temaService.temaActual().colorPrimario).toBe('#10b981');

    // Restaurar atmósfera al salir
    fixture.componentInstance.restaurarAtmosfera();
    expect(temaService.temaActual().colorPrimario).toBe('#e11d48'); // default

    // Abrir crónica 3D
    fixture.componentInstance.abrirCronicaGrimorio(MOCK_REINO_TREBOL);
    expect(state.estaAbierto()).toBe(true);
    expect(state.tipoEntidad()).toBe('reino');
    expect(state.reinoActivo()?.slug).toBe('trebol');
  });

  it('VistaReinoComponent debe listar escenarios y magos del reino', () => {
    const fixture = TestBed.createComponent(VistaReinoComponent);
    fixture.componentRef.setInput('slug', 'trebol');
    fixture.detectChanges();

    expect(fixture.componentInstance.slug()).toBe('trebol');
  });

  it('GrimorioStateService debe soportar ciclo completo de apertura, folios y bloqueo', () => {
    const state = TestBed.inject(GrimorioStateService);
    state.abrirPersonaje(MOCK_ASTA, 0);

    expect(state.estaAbierto()).toBe(true);
    expect(state.paginaActual()).toBe(0);

    state.paginaSiguiente();
    expect(state.paginaActual()).toBe(1);

    state.setAnimando(true);
    expect(state.paginaSiguiente()).toBe(false);

    state.setAnimando(false);
    state.cerrar();
    expect(state.estaAbierto()).toBe(false);
  });

  it('HechizoVideoComponent y PaginaHechizoComponent deben sincronizar folios y clips', () => {
    const fixture = TestBed.createComponent(PaginaHechizoComponent);
    fixture.componentRef.setInput('personaje', MOCK_ASTA);
    fixture.componentRef.setInput('hechizo', MOCK_ASTA.hechizos[0]);
    fixture.componentRef.setInput('numeroPagina', 1);
    fixture.componentRef.setInput('activa', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.tituloActual()).toBe('Espada Danma: Tajo de Antimagia');
    expect(fixture.componentInstance.esPaginaCero()).toBe(false);
  });
});
