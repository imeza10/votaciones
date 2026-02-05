import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService, UsuarioFormData, UsuariosFilters } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/models/user.model';

@Component({
  selector: 'app-digitadores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './digitadores.component.html',
  styleUrls: ['./digitadores.component.scss']
})
export class DigitadoresComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Signals
  digitadores = signal<Usuario[]>([]);
  coordinadores = signal<Usuario[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  modalMode: 'crear' | 'editar' = 'crear';
  selectedDigitador: Usuario | null = null;

  // Paginación
  currentPage = 1;
  perPage = 20;
  totalPages = 0;
  totalRecords = 0;

  // Filtros
  searchTerm = '';
  filterCoordinador = '';
  filterActivo = '';
  private searchTimeout: any;

  // Formulario
  digitadorForm!: FormGroup;
  formErrors: string[] = [];

  ngOnInit() {
    this.initForm();
    this.cargarCoordinadores();
    this.cargarDigitadores();
  }

  initForm() {
    this.digitadorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
      email: ['', [Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      password: ['', []],
      coordinador_id: ['', Validators.required],
      activo: [true]
    });
  }

  cargarCoordinadores() {
    this.usuariosService.getCoordinadores().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.coordinadores.set(response.data);
        }
      },
      error: (error) => console.error('Error al cargar coordinadores:', error)
    });
  }

  cargarDigitadores() {
    this.loading.set(true);

    const filters: UsuariosFilters = {
      rol: 'digitador',
      busqueda: this.searchTerm || undefined,
      coordinador_id: this.filterCoordinador ? Number(this.filterCoordinador) : undefined,
      activo: this.filterActivo || undefined,
      page: this.currentPage,
      per_page: this.perPage
    };

    this.usuariosService.getUsuarios(filters).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.digitadores.set(response.data.usuarios);
          this.totalRecords = response.data.total;
          this.totalPages = response.data.total_pages;
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al cargar digitadores:', error);
        alert('Error al cargar los digitadores');
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.cargarDigitadores();
    }, 500);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.cargarDigitadores();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterCoordinador = '';
    this.filterActivo = '';
    this.currentPage = 1;
    this.cargarDigitadores();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cargarDigitadores();
    }
  }

  openCreateModal() {
    this.modalMode = 'crear';
    this.selectedDigitador = null;
    this.digitadorForm.reset({ activo: true });
    this.digitadorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.digitadorForm.get('password')?.updateValueAndValidity();
    this.formErrors = [];
    this.showModal.set(true);
  }

  openEditModal(digitador: Usuario) {
    this.modalMode = 'editar';
    this.selectedDigitador = digitador;
    
    this.digitadorForm.patchValue({
      nombre: digitador.nombre,
      apellidos: digitador.apellidos,
      documento: digitador.documento,
      email: digitador.email || '',
      telefono: digitador.telefono || '',
      coordinador_id: digitador.coordinador_id || '',
      activo: digitador.activo
    });

    // Password opcional en edición
    this.digitadorForm.get('password')?.clearValidators();
    this.digitadorForm.get('password')?.updateValueAndValidity();
    
    this.formErrors = [];
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.digitadorForm.reset();
    this.selectedDigitador = null;
  }

  onSubmit() {
    if (this.digitadorForm.invalid) {
      this.digitadorForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.formErrors = [];

    const formData: UsuarioFormData = {
      ...this.digitadorForm.value,
      rol: 'digitador'
    };

    // Si no hay password en edición, no enviarlo
    if (this.modalMode === 'editar' && !formData.password) {
      delete formData.password;
    }

    const request = this.modalMode === 'crear'
      ? this.usuariosService.crearUsuario(formData)
      : this.usuariosService.actualizarUsuario(this.selectedDigitador!.id, formData);

    request.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          alert(this.modalMode === 'crear' ? 'Digitador creado exitosamente' : 'Digitador actualizado exitosamente');
          this.closeModal();
          this.cargarDigitadores();
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error:', error);
        this.formErrors = [error.error?.message || 'Error al guardar el digitador'];
      }
    });
  }

  openDeleteModal(digitador: Usuario) {
    this.selectedDigitador = digitador;
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedDigitador = null;
  }

  confirmDelete() {
    if (!this.selectedDigitador) return;

    this.loading.set(true);

    this.usuariosService.eliminarUsuario(this.selectedDigitador.id).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          alert('Digitador eliminado exitosamente');
          this.closeDeleteModal();
          this.cargarDigitadores();
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error:', error);
        alert(error.error?.message || 'Error al eliminar el digitador');
        this.closeDeleteModal();
      }
    });
  }

  cambiarEstado(digitador: Usuario) {
    const nuevoEstado = !digitador.activo;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro que desea ${mensaje} este digitador?`)) {
      this.usuariosService.cambiarEstado(digitador.id, nuevoEstado).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Estado actualizado exitosamente');
            this.cargarDigitadores();
          }
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al cambiar el estado');
        }
      });
    }
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-danger';
  }

  getEstadoText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  // Exponer Math para el template
  Math = Math;
}
