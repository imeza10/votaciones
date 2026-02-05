import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { Votante } from '../models/votante.model';

export interface VotanteFilter {
  search?: string;
  departamento_id?: number;
  municipio_id?: number;
  barrio_id?: number;
  lider_id?: number;
  coordinador_id?: number;
  es_jurado?: boolean;
  page?: number;
  limit?: number;
}

export interface VotantesPaginados {
  data: Votante[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class VotantesService {
  private apiUrl = `${environment.apiUrl}/votantes`;

  constructor(private http: HttpClient) {}

  listar(filtros: VotanteFilter = {}): Observable<ApiResponse<VotantesPaginados>> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof VotanteFilter];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<VotantesPaginados>>(`${this.apiUrl}`, { params });
  }

  obtener(id: number): Observable<ApiResponse<Votante>> {
    return this.http.get<ApiResponse<Votante>>(`${this.apiUrl}/${id}`);
  }

  crear(votante: Partial<Votante>): Observable<ApiResponse<Votante>> {
    return this.http.post<ApiResponse<Votante>>(`${this.apiUrl}`, votante);
  }

  actualizar(id: number, votante: Partial<Votante>): Observable<ApiResponse<Votante>> {
    return this.http.put<ApiResponse<Votante>>(`${this.apiUrl}/${id}`, votante);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  verificarDuplicado(documento: string, excludeId?: number): Observable<ApiResponse<{ existe: boolean }>> {
    let params = new HttpParams().set('documento', documento);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }
    return this.http.get<ApiResponse<{ existe: boolean }>>(`${this.apiUrl}/verificar-duplicado`, { params });
  }
}
