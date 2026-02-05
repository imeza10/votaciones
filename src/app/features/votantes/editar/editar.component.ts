import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { VotantesService } from '../../../core/services/votantes.service';
import { LocationService, Departamento, Municipio, Barrio, LugarVotacion } from '../../../core/services/location.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingComponent],
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class EditarComponent implements OnInit {
  votanteForm: FormGroup;
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  votanteId!: number;
  
  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);
  barrios = signal<Barrio[]>([]);
  lugaresVotacion = signal<LugarVotacion[]>([]);

  constructor(
    private fb: FormBuilder,
    private votantesService: VotantesService,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.votanteForm = this.fb.group({
      documento: ['', [Validators.required, Validators.minLength(6)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.pattern(/^[0-9]{7,10}$/)]],
      direccion: [''],
      departamento_id: ['', Validators.required],
      municipio_id: ['', Validators.required],
      barrio_id: [''],
      comuna: [''],
      lugar_votacion_id: [''],
      mesa: ['', [Validators.pattern(/^[0-9]+$/)]],
      zona: ['urbana', Validators.required],
      es_jurado: [false],
      observaciones: [''],
      lider_id: ['']
    });
  }

  ngOnInit(): void {
    this.votanteId = +this.route.snapshot.params['id'];
    this.cargarDepartamentos();
    this.cargarVotante();
    this.setupFormListeners();
  }

  cargarVotante(): void {
    this.loading.set(true);
    this.votantesService.obtener(this.votanteId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const votante = response.data;
          
          // Primero cargar municipios y barrios según los datos del votante
          if (votante.departamento_id) {
            this.cargarMunicipios(votante.departamento_id);
          }
          
          if (votante.municipio_id) {
            this.cargarBarrios(votante.municipio_id);
            this.cargarLugaresVotacion(votante.municipio_id);
          }
          
          // Luego llenar el formulario
          setTimeout(() => {
            this.votanteForm.patchValue({
              documento: votante.documento,
              nombres: votante.nombres,
              apellidos: votante.apellidos,
              telefono: votante.telefono,
              direccion: votante.direccion,
              departamento_id: votante.departamento_id,
              municipio_id: votante.municipio_id,
              barrio_id: votante.barrio_id,
              comuna: votante.comuna,
              lugar_votacion_id: votante.lugar_votacion_id,
              mesa: votante.mesa,
              zona: votante.zona || 'urbana',
              es_jurado: votante.es_jurado || false,
              observaciones: votante.observaciones,
              lider_id: votante.lider_id
            });
            this.loading.set(false);
          }, 500);
        }
      },
      error: () => {
        this.error.set('Error al cargar el votante');
        this.loading.set(false);
      }
    });
  }

  cargarDepartamentos(): void {
    this.locationService.getDepartamentos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.departamentos.set(response.data);
        }
      },
      error: () => this.error.set('Error al cargar departamentos')
    });
  }

  setupFormListeners(): void {
    this.votanteForm.get('departamento_id')?.valueChanges.subscribe(departamentoId => {
      if (departamentoId) {
        this.cargarMunicipios(departamentoId);
      }
    });

    this.votanteForm.get('municipio_id')?.valueChanges.subscribe(municipioId => {
      if (municipioId) {
        this.cargarBarrios(municipioId);
        this.cargarLugaresVotacion(municipioId);
      }
    });
  }

  cargarMunicipios(departamentoId: number): void {
    this.locationService.getMunicipios(departamentoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.municipios.set(response.data);
        }
      }
    });
  }

  cargarBarrios(municipioId: number): void {
    this.locationService.getBarrios(municipioId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.barrios.set(response.data);
        }
      }
    });
  }

  cargarLugaresVotacion(municipioId: number): void {
    this.locationService.getLugaresVotacion(municipioId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lugaresVotacion.set(response.data);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.votanteForm.invalid) {
      Object.keys(this.votanteForm.controls).forEach(key => {
        this.votanteForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.votantesService.actualizar(this.votanteId, this.votanteForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.success.set(true);
          setTimeout(() => {
            this.router.navigate(['/votantes/lista']);
          }, 1500);
        } else {
          this.error.set(response.message || 'Error al actualizar votante');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error de conexión. Intente nuevamente.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/votantes/lista']);
  }
}
