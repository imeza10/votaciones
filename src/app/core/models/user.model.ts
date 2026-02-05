export interface Usuario {
  id: number;
  tenant_id: number;
  candidato_id?: number;
  coordinador_id?: number;
  nombre: string;
  apellidos: string;
  documento: string;
  email?: string;
  telefono?: string;
  rol: 'superadmin' | 'admin_candidato' | 'coordinador' | 'lider' | 'digitador' | 'transportador';
  activo: boolean;
  ultimo_acceso?: Date;
  created_at: Date;
  updated_at: Date;
  // Propiedades dinámicas del backend
  coordinador_nombre?: string;
  total_lideres?: number;
  [key: string]: any; // Para propiedades dinámicas adicionales
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface LoginCredentials {
  documento: string;
  password: string;
}
