export interface Votante {
  id: number;
  tenant_id: number;
  candidato_id: number;
  lider_id?: number;
  coordinador_id?: number;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  departamento_id: number;
  municipio_id: number;
  barrio_id?: number;
  comuna?: string;
  lugar_votacion_id?: number;
  mesa?: string;
  zona: 'urbana' | 'rural';
  latitud?: number;
  longitud?: number;
  es_jurado: boolean;
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
}
