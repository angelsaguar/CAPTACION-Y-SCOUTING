import { supabase } from './supabase';
import { Coach } from '@/types';

const LOCAL_STORAGE_KEY = 'ud_lapoveda_coaches_backup';

const DEFAULT_COACHES: Coach[] = [
  {
    id: 'coach-1',
    nombre: 'Carlos Martínez',
    club: 'RCD Carabanchel',
    equipo: 'Juvenil A',
    categoria: 'Autonómica',
    edad: 38,
    observaciones: 'Entrenador con perfil muy metodológico, bueno gestionando grupos de cantera y con propuesta de juego combinativo.',
    created_at: new Date().toISOString()
  },
  {
    id: 'coach-2',
    nombre: 'David Sanz',
    club: 'AD Arganda',
    equipo: 'Sénior B',
    categoria: 'Primera Regional',
    edad: 42,
    observaciones: 'Mucha experiencia en categorías senior. Muy intenso defensivamente y destaca por la gestión de vestuario.',
    created_at: new Date().toISOString()
  }
];

export async function getCoaches(): Promise<Coach[]> {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    } else {
      console.warn('Supabase returned error or empty for coaches:', error);
    }
  } catch (error) {
    console.warn('Could not fetch coaches from Supabase, falling back to localStorage:', error);
  }

  // Local fallback
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return DEFAULT_COACHES;
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_COACHES));
  return DEFAULT_COACHES;
}

export async function addCoach(
  nombre: string,
  club: string,
  equipo: string,
  categoria: string,
  edad?: number,
  observaciones?: string,
  created_by?: string
): Promise<Coach> {
  const trimmedNombre = nombre.trim();
  const trimmedClub = club.trim();
  const trimmedEquipo = equipo.trim();
  const trimmedCategoria = categoria.trim();

  if (!trimmedNombre) throw new Error('El nombre del entrenador es obligatorio');
  if (!trimmedClub) throw new Error('El club actual es obligatorio');
  if (!trimmedEquipo) throw new Error('El equipo que dirige es obligatorio');
  if (!trimmedCategoria) throw new Error('La categoría es obligatoria');

  const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);

  const newCoach: Coach = {
    id: newId,
    nombre: trimmedNombre,
    club: trimmedClub,
    equipo: trimmedEquipo,
    categoria: trimmedCategoria,
    edad: edad || undefined,
    observaciones: observaciones?.trim() || '',
    created_by,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('coaches')
      .insert([newCoach])
      .select()
      .single();

    if (!error && data) {
      await getCoaches();
      return data;
    }
    if (error) {
      console.warn('Supabase insert coach failed, trying offline-first fallback:', error);
    }
  } catch (err) {
    console.warn('Exception inserting coach to Supabase:', err);
  }

  // Local fallback insert
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  let list: Coach[] = [];
  if (cached) {
    try {
      list = JSON.parse(cached);
    } catch {
      list = DEFAULT_COACHES;
    }
  } else {
    list = DEFAULT_COACHES;
  }

  const updated = [newCoach, ...list];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return newCoach;
}

export async function updateCoach(
  id: string,
  nombre: string,
  club: string,
  equipo: string,
  categoria: string,
  edad?: number,
  observaciones?: string
): Promise<Coach> {
  const trimmedNombre = nombre.trim();
  const trimmedClub = club.trim();
  const trimmedEquipo = equipo.trim();
  const trimmedCategoria = categoria.trim();

  if (!trimmedNombre) throw new Error('El nombre del entrenador es obligatorio');
  if (!trimmedClub) throw new Error('El club actual es obligatorio');
  if (!trimmedEquipo) throw new Error('El equipo es obligatorio');
  if (!trimmedCategoria) throw new Error('La categoría es obligatoria');

  const updatePayload = {
    nombre: trimmedNombre,
    club: trimmedClub,
    equipo: trimmedEquipo,
    categoria: trimmedCategoria,
    edad: edad || null,
    observaciones: observaciones?.trim() || ''
  };

  try {
    const { data, error } = await supabase
      .from('coaches')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      await getCoaches();
      return data;
    }
    if (error) {
      console.warn('Supabase update coach failed, using fallback:', error);
    }
  } catch (err) {
    console.warn('Exception updating coach in Supabase:', err);
  }

  // Local fallback
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  let list: Coach[] = [];
  if (cached) {
    try {
      list = JSON.parse(cached);
    } catch {
      list = DEFAULT_COACHES;
    }
  } else {
    list = DEFAULT_COACHES;
  }

  const index = list.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('No se encontró el entrenador para actualizar');
  }

  const updatedCoach = {
    ...list[index],
    ...updatePayload,
    edad: edad || undefined
  };

  list[index] = updatedCoach;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  return updatedCoach;
}

export async function deleteCoach(id: string): Promise<boolean> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
    try {
      const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', id);

      if (!error) {
        await getCoaches().catch(() => {});
      } else {
        console.warn('Supabase error while deleting coach:', error);
      }
    } catch (err) {
      console.warn('Failed deleting coach from Supabase:', err);
    }
  } else {
    console.info('Skipping Supabase delete because ID is not a valid UUID:', id);
  }

  // Local fallback - always complete delete operation locally
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const list: Coach[] = JSON.parse(cached);
      const filtered = list.filter(c => c.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }
  return true;
}
