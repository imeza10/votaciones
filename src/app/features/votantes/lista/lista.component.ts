import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VotantesService } from '../../../core/services/votantes.service';
import { LocationService } from '../../../core/services/location.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface Votante {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  municipio_nombre: string;
  lider_nombres: string;
  lider_apellidos: string;
  voto_confirmado: boolean;
}

interface Meta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {
  votantes: Votante[] = [];
  loading = false;
  searchTerm = '';
  Math = Math;
  
  filtros = {
    departamento_id: '',
    municipio_id: '',
    lider_id: '',
    voto_confirmado: ''
  };
  
  meta: Meta = {
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  };
  
  departamentos: any[] = [];
  municipios: any[] = [];
  
  showDeleteModal = false;
  votanteAEliminar: Votante | null = null;
  
  private searchTimeout: any;
  
  constructor(
    private votantesService: VotantesService,
    private locationService: LocationService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarVotantes();
    this.cargarDepartamentos();
  }
  
  cargarVotantes(): void {
    this.loading = true;
    
    const params: any = {
      page: this.meta.current_page,
      per_page: this.meta.per_page
    };
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    
    Object.keys(this.filtros).forEach(key => {
      if (this.filtros[key as keyof typeof this.filtros]) {
        params[key] = this.filtros[key as keyof typeof this.filtros];
      }
    });
    
    this.votantesService.listar(params).subscribe({
      next: (response) => {
        if (response.data) {
          this.votantes = (response.data.data || []) as any;
          this.meta = {
            current_page: response.data.page || 1,
            per_page: response.data.limit || 10,
            total: response.data.total || 0,
            last_page: response.data.total_pages || 1
          };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar votantes:', error);
        this.loading = false;
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
    this.filtros.municipio_id = '';
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
      this.meta.current_page = 1;
      this.cargarVotantes();
    }, 500);
  }
  
  aplicarFiltros(): void {
    this.meta.current_page = 1;
    this.cargarVotantes();
  }
  
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtros = {
      departamento_id: '',
      municipio_id: '',
      lider_id: '',
      voto_confirmado: ''
    };
    this.municipios = [];
    this.cargarVotantes();
  }
  
  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.meta.last_page) {
      this.meta.current_page = page;
      this.cargarVotantes();
    }
  }
  
  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const halfMax = Math.floor(maxPages / 2);
    
    let startPage = Math.max(1, this.meta.current_page - halfMax);
    let endPage = Math.min(this.meta.last_page, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  nuevoVotante(): void {
    this.router.navigate(['/votantes/registro']);
  }
  
  verDetalle(votante: Votante): void {
    // TODO: Implementar vista de detalle
    console.log('Ver detalle:', votante);
  }
  
  editarVotante(votante: Votante): void {
    this.router.navigate(['/votantes/editar', votante.id]);
  }
  
  confirmarEliminar(votante: Votante): void {
    this.votanteAEliminar = votante;
    this.showDeleteModal = true;
  }
  
  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.votanteAEliminar = null;
  }
  
  eliminarVotante(): void {
    if (!this.votanteAEliminar) return;
    
    this.votantesService.eliminar(this.votanteAEliminar.id).subscribe({
      next: () => {
        this.cargarVotantes();
        this.cancelarEliminar();
        // TODO: Mostrar mensaje de éxito
      },
      error: (error) => {
        console.error('Error al eliminar votante:', error);
        // TODO: Mostrar mensaje de error
      }
    });
  }
}
