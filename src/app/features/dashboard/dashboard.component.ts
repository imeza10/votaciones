import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EstadisticaCard {
  titulo: string;
  valor: number;
  icono: string;
  color: string;
  cambio?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  estadisticas = signal<EstadisticaCard[]>([
    {
      titulo: 'Total Votantes',
      valor: 0,
      icono: 'pi-users',
      color: 'blue',
      cambio: '+12% este mes'
    },
    {
      titulo: 'Votos Confirmados',
      valor: 0,
      icono: 'pi-check-circle',
      color: 'green',
      cambio: '0% de avance'
    },
    {
      titulo: 'Puestos Activos',
      valor: 0,
      icono: 'pi-map-marker',
      color: 'yellow',
      cambio: '0 activos'
    },
    {
      titulo: 'Mensajes Enviados',
      valor: 0,
      icono: 'pi-send',
      color: 'red',
      cambio: '0 este mes'
    }
  ]);

  actividadReciente = signal([
    { tipo: 'votante', mensaje: 'Sistema iniciado correctamente', tiempo: 'Hace un momento', icono: 'pi-info-circle' }
  ]);

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    // Aquí se harían las llamadas al backend
    // Por ahora, datos de ejemplo
  }
}
