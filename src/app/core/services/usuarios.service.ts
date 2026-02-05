import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/user.model';
import { ApiResponse } from '../models/response.model';

export interface UsuarioFormData {
  nombre: string;
  apellidos: string;
  documento: string;
  email?: string;
  telefono?: string;
  password?: string;
  rol: 'coordinador' | 'lider' | 'digitador' | 'transportador';
  coordinador_id?: number;
  activo?: boolean;
}

export interface UsuariosFilters {
  busqueda?: string;
  rol?: string;
  coordinador_id?: number;
  activo?: string;
  page?: number;
  per_page?: number;
}

export interface UsuariosListResponse {
  usuarios: Usuario[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  getUsuarios(filters: UsuariosFilters = {}): Observable<ApiResponse<UsuariosListResponse>> {
    let params = new HttpParams();

    if (filters.busqueda) {
      params = params.set('busqueda', filters.busqueda);
    }
    if (filters.rol) {
      params = params.set('rol', filters.rol);
    }
    if (filters.coordinador_id) {
      params = params.set('coordinador_id', filters.coordinador_id.toString());
    }
    if (filters.activo) {
      params = params.set('activo', filters.activo);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }

    return this.http.get<ApiResponse<UsuariosListResponse>>(this.baseUrl, { params });
  }

  /**
   * Obtener usuario por ID
   */
  getUsuarioById(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crear nuevo usuario
   */
  crearUsuario(data: UsuarioFormData): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.baseUrl, data);
  }

  /**
   * Actualizar usuario existente
   */
  actualizarUsuario(id: number, data: Partial<UsuarioFormData>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Eliminar usuario (soft delete)
   */
  eliminarUsuario(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Verificar si existe un documento duplicado
   */
  verificarDocumentoDuplicado(documento: string, excludeId?: number): Observable<ApiResponse<{ existe: boolean }>> {
    let params = new HttpParams().set('documento', documento);
    
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }

    return this.http.get<ApiResponse<{ existe: boolean }>>(`${this.baseUrl}/verificar-duplicado`, { params });
  }

  /**
   * Obtener coordinadores activos (para selects)
   */
  getCoordinadores(): Observable<ApiResponse<Usuario[]>> {
    const params = new HttpParams()
      .set('rol', 'coordinador')
      .set('activo', '1')
      .set('per_page', '1000');

    return this.http.get<ApiResponse<Usuario[]>>(`${this.baseUrl}`, { params });
  }

  /**
   * Cambiar estado de un usuario (activar/desactivar)
   */
  cambiarEstado(id: number, activo: boolean): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(`${this.baseUrl}/${id}/estado`, { activo });
  }

  /**
   * Resetear contraseña de un usuario
   */
  resetearPassword(id: number, nuevaPassword: string): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/${id}/password`, { password: nuevaPassword });
  }
}
