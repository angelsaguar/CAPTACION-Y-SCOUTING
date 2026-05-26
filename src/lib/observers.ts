import { supabase } from './supabase';
import { Observer } from '@/types';

const LOCAL_STORAGE_KEY = 'ud_lapoveda_observers_backup';

// Default built-in observers to ensure the list is never completely empty
const DEFAULT_OBSERVERS: Observer[] = [
  { id: 'def-1', nombre: 'Ángel Saguar', created_at: new Date().toISOString() },
  { id: 'def-2', nombre: 'Scout UD La Poveda', created_at: new Date().toISOString() }
];

export async function getObservers(): Promise<Observer[]> {
  try {
    const { data, error } = await supabase
      .from('observers')
      .select('*')
      .order('nombre');

    if (!error && data) {
      // Synchronize to localStorage backup
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    } else {
      console.warn('Supabase returned error or empty for observers:', error);
    }
  } catch (error) {
    console.warn('Could not fetch observers from Supabase, falling back to localStorage:', error);
  }

  // Local fallback
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return DEFAULT_OBSERVERS;
    }
  }

  // Save default observers locally
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_OBSERVERS));
  return DEFAULT_OBSERVERS;
}

export async function addObserver(nombre: string): Promise<Observer> {
  const trimmedName = nombre.trim();
  if (!trimmedName) throw new Error('El nombre del observador no puede estar vacío');

  const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);

  const newObserver: Observer = {
    id: newId,
    nombre: trimmedName,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('observers')
      .insert([newObserver])
      .select()
      .single();

    if (!error && data) {
      // Sync list
      await getObservers();
      return data;
    }
    if (error) {
      console.warn('Supabase insert observer failed (the table might be missing or permission error):', error);
    }
  } catch (error) {
    console.warn('Exception inserting observer to Supabase:', error);
  }

  // Local fallback insert
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  let list: Observer[] = DEFAULT_OBSERVERS;
  if (cached) {
    try {
      list = JSON.parse(cached);
    } catch {
      list = DEFAULT_OBSERVERS;
    }
  }

  // Prevent duplicates
  if (list.some(o => o.nombre.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('Ya existe un observador con este nombre');
  }

  const updated = [...list, newObserver];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return newObserver;
}

export async function deleteObserver(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('observers')
      .delete()
      .eq('id', id);

    if (!error) {
      await getObservers();
      return true;
    }
  } catch (err) {
    console.warn('Failed deleting observer from Supabase:', err);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      const list: Observer[] = JSON.parse(cached);
      const filtered = list.filter(o => o.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
