export interface Tenant {
  id: number;
  uuid: string;
  nombre: string;
  slug: string;
  activo: boolean;
  configuracion?: any;
  created_at: Date;
  updated_at: Date;
}
