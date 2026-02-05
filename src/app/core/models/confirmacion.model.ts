export interface ConfirmacionVoto {
  id: number;
  votante_id: number;
  voto: boolean;
  hora_confirmacion: Date | null;
  confirmado_por_id?: number;
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
}

export interface VotanteConConfirmacion {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  mesa?: string;
  lugar_votacion_id?: number;
  departamento: string;
  municipio: string;
  barrio?: string;
  lider?: string;
  coordinador?: string;
  lugar_votacion?: string;
  lugar_votacion_direccion?: string;
  confirmacion_id?: number;
  voto: boolean;
  hora_confirmacion?: Date | null;
  confirmacion_observaciones?: string;
  confirmado_por?: string;
  confirmado: boolean;
}

export interface EstadisticasConfirmacion {
  resumen: {
    total_votantes: number;
    total_confirmados: number;
    votos_favor: number;
    votos_contra: number;
    pendientes: number;
    porcentaje_confirmacion: number;
    porcentaje_favor: number;
    porcentaje_contra: number;
  };
  por_municipio: Array<{
    municipio: string;
    total: number;
    confirmados: number;
    votos_favor: number;
  }>;
  por_hora: Array<{
    hora: number;
    confirmaciones: number;
  }>;
  top_confirmadores: Array<{
    nombres: string;
    apellidos: string;
    total_confirmaciones: number;
  }>;
}

export interface ConfirmacionRequest {
  votante_id: number;
  voto: boolean;
  observaciones?: string;
}
