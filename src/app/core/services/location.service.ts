import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';

export interface Departamento {
  id: number;
  codigo: string;
  nombre: string;
  region?: string;
}

export interface Municipio {
  id: number;
  departamento_id: number;
  codigo: string;
  nombre: string;
}

export interface Barrio {
  id: number;
  municipio_id: number;
  nombre: string;
  comuna?: string;
  zona: 'urbana' | 'rural';
}

export interface LugarVotacion {
  id: number;
  municipio_id: number;
  codigo?: string;
  nombre: string;
  direccion?: string;
  zona: 'urbana' | 'rural';
  total_mesas: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<ApiResponse<Departamento[]>> {
    return this.http.get<ApiResponse<Departamento[]>>(`${this.apiUrl}/ubicaciones/departamentos`);
  }

  getMunicipios(departamentoId: number): Observable<ApiResponse<Municipio[]>> {
    return this.http.get<ApiResponse<Municipio[]>>(`${this.apiUrl}/ubicaciones/municipios/${departamentoId}`);
  }

  getBarrios(municipioId: number): Observable<ApiResponse<Barrio[]>> {
    return this.http.get<ApiResponse<Barrio[]>>(`${this.apiUrl}/ubicaciones/barrios/${municipioId}`);
  }

  getLugaresVotacion(municipioId: number): Observable<ApiResponse<LugarVotacion[]>> {
    return this.http.get<ApiResponse<LugarVotacion[]>>(`${this.apiUrl}/ubicaciones/lugares-votacion/${municipioId}`);
  }
}
