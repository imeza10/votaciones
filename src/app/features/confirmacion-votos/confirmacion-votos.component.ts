import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmacionService, FiltrosConfirmacion } from '../../core/services/confirmacion.service';
import { LocationService } from '../../core/services/location.service';
import { VotanteConConfirmacion, EstadisticasConfirmacion } from '../../core/models/confirmacion.model';

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

@Component({
  selector: 'app-confirmacion-votos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmacion-votos.component.html',
  styleUrls: ['./confirmacion-votos.component.scss']
})
export class ConfirmacionVotosComponent implements OnInit {
  votantes: VotanteConConfirmacion[] = [];
  estadisticas: EstadisticasConfirmacion | null = null;
  loading = false;
  searchTerm = '';
  Math = Math;
  
  filtros: FiltrosConfirmacion = {
    page: 1,
    per_page: 10,
    confirmado: false, // Por defecto solo pendientes
  };
  
  pagination: Pagination = {
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1
  };
  
  departamentos: any[] = [];
  municipios: any[] = [];
  
  showConfirmModal = false;
  votanteAConfirmar: VotanteConConfirmacion | null = null;
  confirmacionVoto: boolean = true;
  confirmacionObservaciones: string = '';
  
  vistaActual: 'pendientes' | 'confirmados' | 'todos' = 'pendientes';
  
  private searchTimeout: any;
  
  constructor(
    private confirmacionService: ConfirmacionService,
    private locationService: LocationService
  ) {}
  
  ngOnInit(): void {
    this.cargarVotantes();
    this.cargarEstadisticas();
    this.cargarDepartamentos();
  }
  
  cargarVotantes(): void {
    this.loading = true;
    
    const params: FiltrosConfirmacion = {
      ...this.filtros,
      search: this.searchTerm || undefined
    };
    
    this.confirmacionService.listarConfirmaciones(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.votantes = response.data.data || [];
          this.pagination = response.data.pagination || this.pagination;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar votantes:', error);
        this.loading = false;
      }
    });
  }
  
  cargarEstadisticas(): void {
    const filtros = {
      departamento_id: this.filtros.departamento_id,
      municipio_id: this.filtros.municipio_id
    };
    
    this.confirmacionService.obtenerEstadisticas(filtros).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.estadisticas = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }
  
  cargarDepartamentos(): void {
    this.locationService.getDepartamentos().subscribe({
      next: (response) => {
        this.departamentos = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
      }
    });
  }
  
  onDepartamentoChange(): void {
    this.filtros.municipio_id = undefined;
    this.municipios = [];
    
    if (this.filtros.departamento_id) {
      this.locationService.getMunicipios(+this.filtros.departamento_id).subscribe({
        next: (response) => {
          this.municipios = response.data || [];
        },
        error: (error) => {
          console.error('Error al cargar municipios:', error);
        }
      });
    }
    
    this.aplicarFiltros();
  }
  
  onMunicipioChange(): void {
    this.aplicarFiltros();
  }
  
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filtros.page = 1;
      this.cargarVotantes();
    }, 500);
  }
  
  aplicarFiltros(): void {
    this.filtros.page = 1;
    this.cargarVotantes();
    this.cargarEstadisticas();
  }
  
  cambiarVista(vista: 'pendientes' | 'confirmados' | 'todos'): void {
    this.vistaActual = vista;
    
    if (vista === 'pendientes') {
      this.filtros.confirmado = false;
    } else if (vista === 'confirmados') {
      this.filtros.confirmado = true;
    } else {
      this.filtros.confirmado = undefined;
    }
    
    this.aplicarFiltros();
  }
  
  limpiarFiltros(): void {
    this.filtros = {
      page: 1,
      per_page: 10,
      confirmado: this.vistaActual === 'pendientes' ? false : 
                  this.vistaActual === 'confirmados' ? true : undefined
    };
    this.searchTerm = '';
    this.municipios = [];
    this.cargarVotantes();
    this.cargarEstadisticas();
  }
  
  abrirModalConfirmacion(votante: VotanteConConfirmacion): void {
    this.votanteAConfirmar = votante;
    this.confirmacionVoto = true;
    this.confirmacionObservaciones = votante.confirmacion_observaciones || '';
    this.showConfirmModal = true;
  }
  
  cerrarModal(): void {
    this.showConfirmModal = false;
    this.votanteAConfirmar = null;
    this.confirmacionVoto = true;
    this.confirmacionObservaciones = '';
  }
  
  confirmarVoto(): void {
    if (!this.votanteAConfirmar) return;
    
    const data = {
      votante_id: this.votanteAConfirmar.id,
      voto: this.confirmacionVoto,
      observaciones: this.confirmacionObservaciones || undefined
    };
    
    this.loading = true;
    
    this.confirmacionService.confirmarVoto(data).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Voto confirmado exitosamente');
          this.cerrarModal();
          this.cargarVotantes();
          this.cargarEstadisticas();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al confirmar voto:', error);
        alert('Error al confirmar voto. Por favor intente nuevamente.');
        this.loading = false;
      }
    });
  }
  
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.pagination.total_pages) {
      this.filtros.page = pagina;
      this.cargarVotantes();
    }
  }
  
  getPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.pagination.current_page - 2);
    const fin = Math.min(this.pagination.total_pages, this.pagination.current_page + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
}
