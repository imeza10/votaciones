import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService, UsuarioFormData, UsuariosFilters } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/models/user.model';

@Component({
  selector: 'app-coordinadores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coordinadores.component.html',
  styleUrls: ['./coordinadores.component.scss']
})
export class CoordinadoresComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Signals
  coordinadores = signal<Usuario[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  modalMode: 'crear' | 'editar' = 'crear';
  selectedCoordinador: Usuario | null = null;

  // Paginación
  currentPage = 1;
  perPage = 20;
  totalPages = 0;
  totalRecords = 0;

  // Filtros
  searchTerm = '';
  filterActivo = '';
  private searchTimeout: any;

  // Formulario
  coordinadorForm!: FormGroup;
  formErrors: string[] = [];

  ngOnInit() {
    this.initForm();
    this.cargarCoordinadores();
  }

  initForm() {
    this.coordinadorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
      email: ['', [Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      password: ['', []],
      activo: [true]
    });
  }

  cargarCoordinadores() {
    this.loading.set(true);

    const filters: UsuariosFilters = {
      rol: 'coordinador',
      busqueda: this.searchTerm || undefined,
      activo: this.filterActivo || undefined,
      page: this.currentPage,
      per_page: this.perPage
    };

    this.usuariosService.getUsuarios(filters).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.coordinadores.set(response.data.usuarios);
          this.totalRecords = response.data.total;
          this.totalPages = response.data.total_pages;
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al cargar coordinadores:', error);
        alert('Error al cargar los coordinadores');
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.cargarCoordinadores();
    }, 500);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.cargarCoordinadores();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterActivo = '';
    this.currentPage = 1;
    this.cargarCoordinadores();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cargarCoordinadores();
    }
  }

  openCreateModal() {
    this.modalMode = 'crear';
    this.selectedCoordinador = null;
    this.coordinadorForm.reset({ activo: true });
    this.coordinadorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.coordinadorForm.get('password')?.updateValueAndValidity();
    this.formErrors = [];
    this.showModal.set(true);
  }

  openEditModal(coordinador: Usuario) {
    this.modalMode = 'editar';
    this.selectedCoordinador = coordinador;
    
    this.coordinadorForm.patchValue({
      nombre: coordinador.nombre,
      apellidos: coordinador.apellidos,
      documento: coordinador.documento,
      email: coordinador.email || '',
      telefono: coordinador.telefono || '',
      activo: coordinador.activo
    });

    // Password opcional en edición
    this.coordinadorForm.get('password')?.clearValidators();
    this.coordinadorForm.get('password')?.updateValueAndValidity();
    
    this.formErrors = [];
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.coordinadorForm.reset();
    this.selectedCoordinador = null;
  }

  onSubmit() {
    if (this.coordinadorForm.invalid) {
      this.coordinadorForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.formErrors = [];

    const formData: UsuarioFormData = {
      ...this.coordinadorForm.value,
      rol: 'coordinador'
    };

    // Si no hay password en edición, no enviarlo
    if (this.modalMode === 'editar' && !formData.password) {
      delete formData.password;
    }

    const request = this.modalMode === 'crear'
      ? this.usuariosService.crearUsuario(formData)
      : this.usuariosService.actualizarUsuario(this.selectedCoordinador!.id, formData);

    request.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          alert(this.modalMode === 'crear' ? 'Coordinador creado exitosamente' : 'Coordinador actualizado exitosamente');
          this.closeModal();
          this.cargarCoordinadores();
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error:', error);
        this.formErrors = [error.error?.message || 'Error al guardar el coordinador'];
      }
    });
  }

  openDeleteModal(coordinador: Usuario) {
    this.selectedCoordinador = coordinador;
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedCoordinador = null;
  }

  confirmDelete() {
    if (!this.selectedCoordinador) return;

    this.loading.set(true);

    this.usuariosService.eliminarUsuario(this.selectedCoordinador.id).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          alert('Coordinador eliminado exitosamente');
          this.closeDeleteModal();
          this.cargarCoordinadores();
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error:', error);
        alert(error.error?.message || 'Error al eliminar el coordinador');
        this.closeDeleteModal();
      }
    });
  }

  cambiarEstado(coordinador: Usuario) {
    const nuevoEstado = !coordinador.activo;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro que desea ${mensaje} este coordinador?`)) {
      this.usuariosService.cambiarEstado(coordinador.id, nuevoEstado).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Estado actualizado exitosamente');
            this.cargarCoordinadores();
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
