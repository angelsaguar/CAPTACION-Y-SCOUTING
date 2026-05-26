export type Role = 'admin' | 'scout';

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  created_at?: string;
}

export type PlayerStatus = 'Observado' | 'En seguimiento' | 'Interesa' | 'Fichado' | 'Rechazado';
export type ContactType = 'Padre' | 'Madre' | 'Jugador';
export type Lateralidad = 'Izquierdo' | 'Derecho' | 'Ambidiestro';

export interface Player {
  id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  contacto_tipo?: ContactType;
  equipo_actual?: string;
  dorsal?: string;
  posicion: string;
  lateralidad?: Lateralidad;
  anio_nacimiento?: number;
  foto_url?: string;
  observaciones?: string;
  motivos_rechazo?: string;
  fecha_seguimiento?: string;
  potencial: number; // 1-5
  estado: PlayerStatus;
  observador?: string; // name of the observer/scout
  created_by?: string;
  created_at?: string;
  attributes?: PlayerAttribute[];
  tags?: string[];
}

export interface Observer {
  id: string;
  nombre: string;
  created_at?: string;
}

export interface PlayerAttribute {
  player_id: string;
  atributo: string;
  valor: number; // 0-5
}

export const POSITION_ATTRIBUTES: Record<string, string[]> = {
  PORTERO: ['Reflejos', 'Juego aéreo', '1 contra 1', 'Juego con los pies', 'Colocación', 'Comunicación y liderazgo'],
  CENTRAL: ['Posicionamiento', 'Duelo defensivo', 'Juego aéreo', 'Salida de balón', 'Concentración', 'Velocidad correctiva'],
  LATERAL: ['Resistencia física', 'Capacidad ofensiva', 'Defensa en espacios abiertos', 'Velocidad', 'Lectura táctica'],
  'MEDIO CENTRO DEFENSIVO': ['Lectura táctica', 'Posicionamiento', 'Recuperación y anticipación', 'Primer pase', 'Control del ritmo', 'Disciplina táctica'],
  INTERIOR: ['Capacidad física ida y vuelta', 'Conducción progresiva', 'Creatividad', 'Presión y trabajo defensivo', 'Inteligencia espacial'],
  'MEDIA PUNTA': ['Creatividad', 'Último pase', 'Recepción entre líneas', 'Regate corto', 'Visión de juego', 'Amenaza ofensiva propia'],
  EXTREMO: ['Desequilibrio individual', 'Velocidad explosiva', 'Producción ofensiva', 'Toma de decisiones', 'Movimientos sin balón', 'Presión tras pérdida'],
  DELANTERO: ['Definición', 'Desmarque', 'Instinto goleador', 'Juego de espaldas', 'Movilidad', 'Mentalidad competitiva'],
};
