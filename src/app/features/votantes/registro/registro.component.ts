import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VotantesService } from '../../../core/services/votantes.service';
import { LocationService, Departamento, Municipio, Barrio, LugarVotacion } from '../../../core/services/location.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {
  votanteForm: FormGroup;
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  
  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);
  barrios = signal<Barrio[]>([]);
  lugaresVotacion = signal<LugarVotacion[]>([]);

  constructor(
    private fb: FormBuilder,
    private votantesService: VotantesService,
    private locationService: LocationService,
    private router: Router
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
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDepartamentos();
    this.setupFormListeners();
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
        this.votanteForm.patchValue({ municipio_id: '', barrio_id: '', lugar_votacion_id: '' });
        this.municipios.set([]);
        this.barrios.set([]);
        this.lugaresVotacion.set([]);
      }
    });

    this.votanteForm.get('municipio_id')?.valueChanges.subscribe(municipioId => {
      if (municipioId) {
        this.cargarBarrios(municipioId);
        this.cargarLugaresVotacion(municipioId);
        this.votanteForm.patchValue({ barrio_id: '', lugar_votacion_id: '' });
      }
    });

    this.votanteForm.get('documento')?.valueChanges.subscribe(documento => {
      if (documento && documento.length >= 6) {
        this.verificarDuplicado(documento);
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

  verificarDuplicado(documento: string): void {
    this.votantesService.verificarDuplicado(documento).subscribe({
      next: (response) => {
        if (response.success && response.data?.existe) {
          this.error.set(`El documento ${documento} ya está registrado`);
          this.votanteForm.get('documento')?.setErrors({ duplicado: true });
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

    this.votantesService.crear(this.votanteForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.success.set(true);
          this.error.set(null);
          setTimeout(() => {
            this.router.navigate(['/votantes/lista']);
          }, 1500);
        } else {
          this.error.set(response.message || 'Error al registrar votante');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error de conexión. Intente nuevamente.');
      }
    });
  }

  limpiarFormulario(): void {
    this.votanteForm.reset({
      zona: 'urbana',
      es_jurado: false
    });
    this.error.set(null);
    this.success.set(false);
  }
}
