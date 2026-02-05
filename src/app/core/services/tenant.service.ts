import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tenant } from '../models/tenant.model';
import { ApiResponse } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTenants(): Observable<ApiResponse<Tenant[]>> {
    return this.http.get<ApiResponse<Tenant[]>>(`${this.API_URL}/tenants`);
  }

  getTenant(id: number): Observable<ApiResponse<Tenant>> {
    return this.http.get<ApiResponse<Tenant>>(`${this.API_URL}/tenants/${id}`);
  }

  createTenant(tenant: Partial<Tenant>): Observable<ApiResponse<Tenant>> {
    return this.http.post<ApiResponse<Tenant>>(`${this.API_URL}/tenants`, tenant);
  }

  updateTenant(id: number, tenant: Partial<Tenant>): Observable<ApiResponse<Tenant>> {
    return this.http.put<ApiResponse<Tenant>>(`${this.API_URL}/tenants/${id}`, tenant);
  }

  deleteTenant(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/tenants/${id}`);
  }
}
