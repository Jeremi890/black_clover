import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { GrimorioStateService } from './core/services/grimorio-state.service';
import { ProgresoJugadorService } from './core/services/progreso-jugador.service';
import { FEATURE_FLAGS } from './core/config/feature-flags';
import { minijuegoGuard } from './core/guards/minijuego.guard';

describe('Black Clover Interactive Grimoire Suite', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('debe inicializar el AppComponent correctamente', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('debe mantener el minijuego en stand-by con FEATURE_FLAGS.minijuegoActivo = false', () => {
    expect(FEATURE_FLAGS.minijuegoActivo).toBe(false);
    const match = (minijuegoGuard as any)({} as any, [], {} as any);
    expect(match).toBe(false);
  });

  it('GrimorioStateService debe controlar la apertura, navegación y cierre del libro 3D', () => {
    const service = TestBed.inject(GrimorioStateService);
    expect(service.estaAbierto()).toBe(false);
    expect(service.paginaActual()).toBe(0);

    const mockPersonaje: any = {
      id: 'asta',
      nombre: 'Asta',
      reino: 'Trébol',
      hechizos: [{ id: 'danma', nombre: 'Espada Danma' }, { id: 'shukuma', nombre: 'Espada Shukuma' }]
    };

    service.abrirPersonaje(mockPersonaje, 0);
    expect(service.estaAbierto()).toBe(true);
    expect(service.tipoEntidad()).toBe('personaje');
    expect(service.totalPaginas()).toBe(3); // 1 bio + 2 hechizos

    // Navegar
    service.paginaSiguiente();
    expect(service.paginaActual()).toBe(1);

    // Bloqueo durante animación
    service.setAnimando(true);
    const intento = service.paginaSiguiente();
    expect(intento).toBe(false);
    expect(service.paginaActual()).toBe(1);

    service.setAnimando(false);
    service.cerrar();
    expect(service.estaAbierto()).toBe(false);
  });

  it('ProgresoJugadorService debe gestionar las estrellas y desbloqueo de hechizos', () => {
    const progreso = TestBed.inject(ProgresoJugadorService);
    expect(progreso.estrellasTotales()).toBeGreaterThan(0);
    expect(progreso.estaDesbloqueado('asta', 'asta-danma', 0)).toBe(true);
  });
});
