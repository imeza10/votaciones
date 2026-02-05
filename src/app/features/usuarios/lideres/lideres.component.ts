import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService, UsuarioFormData, UsuariosFilters } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/models/user.model';

@Component({
  selector: 'app-lideres',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lideres.component.html',
  styleUrls: ['./lideres.component.scss']
})
export class LideresComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Signals
  lideres = signal<Usuario[]>([]);
  coordinadores = signal<Usuario[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  modalMode: 'crear' | 'editar' = 'crear';
  selectedLider: Usuario | null = null;

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
  liderForm!: FormGroup;
  formErrors: string[] = [];

  ngOnInit() {
    this.initForm();
    this.cargarCoordinadores();
    this.cargarLideres();
  }

  initForm() {
    this.liderForm = this.fb.group({
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

  cargarLideres() {
    this.loading.set(true);

    const filters: UsuariosFilters = {
      rol: 'lider',
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
          this.lideres.set(response.data.usuarios);
          this.totalRecords = response.data.total;
          this.totalPages = response.data.total_pages;
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al cargar líderes:', error);
        alert('Error al cargar los líderes');
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.cargarLideres();
    }, 500);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.cargarLideres();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterCoordinador = '';
    this.filterActivo = '';
    this.currentPage = 1;
    this.cargarLideres();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cargarLideres();
    }
  }

  openCreateModal() {
    this.modalMode = 'crear';
    this.selectedLider = null;
    this.liderForm.reset({ activo: true });
    this.liderForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.liderForm.get('password')?.updateValueAndValidity();
    this.formErrors = [];
    this.showModal.set(true);
  }

  openEditModal(lider: Usuario) {
    this.modalMode = 'editar';
    this.selectedLider = lider;
    
    this.liderForm.patchValue({
      nombre: lider.nombre,
      apellidos: lider.apellidos,
      documento: lider.documento,
      email: lider.email || '',
      telefono: lider.telefono || '',
      coordinador_id: lider.coordinador_id || '',
      activo: lider.activo
    });

    // Password opcional en edición
    this.liderForm.get('password')?.clearValidators();
    this.liderForm.get('password')?.updateValueAndValidity();
    
    this.formErrors = [];
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.liderForm.reset();
    this.selectedLider = null;
  }

  onSubmit() {
    if (this.liderForm.invalid) {
      this.liderForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.formErrors = [];

    const formData: UsuarioFormData = {
      ...this.liderForm.value,
      rol: 'lider'
    };

    // Si no hay password en edición, no enviarlo
    if (this.modalMode === 'editar' && !formData.password) {
      delete formData.password;
    }

    const request = this.modalMode === 'crear'
      ? this.usuariosService.crearUsuario(formData)
      : this.usuariosService.actualizarUsuario(this.selectedLider!.id, formData);

    request.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          alert(this.modalMode === 'crear' ? 'Líder creado exitosamente' : 'Líder actualizado exitosamente');
          this.closeModal();
          this.cargarLideres();
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error:', error);
        this.formErrors = [error.error?.message || 'Error al guardar el líder'];
      }
    });
  }

  openDeleteModal(lider: Usuario) {
    this.selectedLider = lider;
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedLider = null;
  }

  confirmDelete() {
    if (!this.selectedLider) return;

    this.loading.set(true);

    this.usuariosService.eliminarUsuario(this.selectedLider.id).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          alert('Líder eliminado exitosamente');
          this.closeDeleteModal();
          this.cargarLideres();
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error:', error);
        alert(error.error?.message || 'Error al eliminar el líder');
        this.closeDeleteModal();
      }
    });
  }

  cambiarEstado(lider: Usuario) {
    const nuevoEstado = !lider.activo;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro que desea ${mensaje} este líder?`)) {
      this.usuariosService.cambiarEstado(lider.id, nuevoEstado).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Estado actualizado exitosamente');
            this.cargarLideres();
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
