import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import {
  VotanteConConfirmacion,
  EstadisticasConfirmacion,
  ConfirmacionRequest,
  ConfirmacionVoto
} from '../models/confirmacion.model';

export interface FiltrosConfirmacion {
  page?: number;
  per_page?: number;
  lider_id?: number;
  coordinador_id?: number;
  departamento_id?: number;
  municipio_id?: number;
  barrio_id?: number;
  confirmado?: boolean;
  voto?: boolean;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmacionService {
  private apiUrl = `${environment.apiUrl}/confirmacion`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de votantes con su estado de confirmación
   */
  listarConfirmaciones(filtros: FiltrosConfirmacion = {}): Observable<ApiResponse<{
    data: VotanteConConfirmacion[],
    pagination: any
  }>> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof FiltrosConfirmacion];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<{
      data: VotanteConConfirmacion[],
      pagination: any
    }>>(this.apiUrl, { params });
  }

  /**
   * Confirmar un voto
   */
  confirmarVoto(data: ConfirmacionRequest): Observable<ApiResponse<ConfirmacionVoto>> {
    return this.http.post<ApiResponse<ConfirmacionVoto>>(this.apiUrl, data);
  }

  /**
   * Actualizar confirmación existente
   */
  actualizarConfirmacion(
    id: number,
    data: Partial<ConfirmacionRequest>
  ): Observable<ApiResponse<ConfirmacionVoto>> {
    return this.http.put<ApiResponse<ConfirmacionVoto>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Obtener estadísticas de confirmación
   */
  obtenerEstadisticas(filtros: Partial<FiltrosConfirmacion> = {}): Observable<ApiResponse<EstadisticasConfirmacion>> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof FiltrosConfirmacion];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<EstadisticasConfirmacion>>(`${this.apiUrl}/estadisticas`, { params });
  }

  /**
   * Obtener votantes pendientes de confirmación
   */
  obtenerPendientes(filtros: Partial<FiltrosConfirmacion> = {}): Observable<ApiResponse<{
    data: VotanteConConfirmacion[],
    pagination: any
  }>> {
    return this.listarConfirmaciones({ ...filtros, confirmado: false });
  }

  /**
   * Obtener votantes confirmados
   */
  obtenerConfirmados(filtros: Partial<FiltrosConfirmacion> = {}): Observable<ApiResponse<{
    data: VotanteConConfirmacion[],
    pagination: any
  }>> {
    return this.listarConfirmaciones({ ...filtros, confirmado: true });
  }
}
