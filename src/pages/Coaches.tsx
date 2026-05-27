import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getCoaches, addCoach, updateCoach, deleteCoach } from '@/lib/coaches';
import { Coach } from '@/types';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Pencil, 
  Check, 
  X, 
  Trophy, 
  User, 
  ShieldAlert,
  Search,
  Briefcase,
  Layers,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

export default function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isAdminOrScout = user?.role === 'admin' || user?.role === 'scout';

  // Form State
  const [nombre, setNombre] = useState('');
  const [club, setClub] = useState('');
  const [equipo, setEquipo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [edad, setEdad] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingClub, setEditingClub] = useState('');
  const [editingEquipo, setEditingEquipo] = useState('');
  const [editingCategoria, setEditingCategoria] = useState('');
  const [editingEdad, setEditingEdad] = useState<string>('');
  const [editingObservaciones, setEditingObservaciones] = useState('');
  const [updating, setUpdating] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState('');
  
  // Delete confirmation state
  const [deleteIdConfirmation, setDeleteIdConfirmation] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoaches() {
      try {
        const data = await getCoaches();
        setCoaches(data);
      } catch (err) {
        toast.error('Error al cargar la lista de entrenadores');
      } finally {
        setLoading(false);
      }
    }
    loadCoaches();
  }, []);

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrScout) {
      toast.error('Solo personal registrado puede añadir entrenadores.');
      return;
    }
    if (!nombre.trim()) {
      toast.error('Por favor, introduce el nombre del entrenador.');
      return;
    }
    if (!club.trim()) {
      toast.error('Por favor, indica su club actual.');
      return;
    }
    if (!equipo.trim()) {
      toast.error('Por favor, introduce el equipo que entrena.');
      return;
    }
    if (!categoria.trim()) {
      toast.error('Por favor, introduce la categoría del equipo.');
      return;
    }

    setSaving(true);
    try {
      const parsedEdad = edad ? parseInt(edad, 10) : undefined;
      const created = await addCoach(
        nombre,
        club,
        equipo,
        categoria,
        parsedEdad,
        observaciones,
        user?.id
      );
      setCoaches(prev => [created, ...prev]);
      setNombre('');
      setClub('');
      setEquipo('');
      setCategoria('');
      setEdad('');
      setObservaciones('');
      toast.success('Entrenador registrado para seguimiento');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el entrenador');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (coach: Coach) => {
    setEditingId(coach.id);
    setEditingNombre(coach.nombre);
    setEditingClub(coach.club);
    setEditingEquipo(coach.equipo);
    setEditingCategoria(coach.categoria);
    setEditingEdad(coach.edad ? coach.edad.toString() : '');
    setEditingObservaciones(coach.observaciones || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateCoach = async (id: string) => {
    if (!isAdminOrScout) {
      toast.error('No tienes permisos suficientes.');
      return;
    }
    if (!editingNombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!editingClub.trim()) {
      toast.error('El club es obligatorio');
      return;
    }
    if (!editingEquipo.trim()) {
      toast.error('El equipo es obligatorio');
      return;
    }
    if (!editingCategoria.trim()) {
      toast.error('La categoría es obligatoria');
      return;
    }

    setUpdating(true);
    try {
      const parsedEdad = editingEdad ? parseInt(editingEdad, 10) : undefined;
      const updated = await updateCoach(
        id,
        editingNombre,
        editingClub,
        editingEquipo,
        editingCategoria,
        parsedEdad,
        editingObservaciones
      );
      setCoaches(prev => prev.map(c => c.id === id ? updated : c));
      setEditingId(null);
      toast.success('Entrenador actualizado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCoach = async (id: string) => {
    if (!isAdminOrScout) {
      toast.error('No tienes permisos suficientes.');
      return;
    }

    try {
      const success = await deleteCoach(id);
      if (success) {
        setCoaches(prev => prev.filter(c => c.id !== id));
        toast.success('Entrenador eliminado de la lista');
        setDeleteIdConfirmation(null);
      } else {
        toast.error('Error al intentar eliminar');
      }
    } catch (err) {
      toast.error('Error al intentar eliminar');
    }
  };

  // Unique list of clubs for filter dropdown
  const uniqueClubs = Array.from(new Set(coaches.map(c => c.club))).filter(Boolean);

  // Filter coaches
  const filteredCoaches = coaches.filter(coach => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = coach.nombre.toLowerCase().includes(searchLower) ||
                      (coach.equipo && coach.equipo.toLowerCase().includes(searchLower)) ||
                      (coach.categoria && coach.categoria.toLowerCase().includes(searchLower));
    const clubMatch = !filterClub || coach.club === filterClub;
    return nameMatch && clubMatch;
  });

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-indigo-500" />
            Entrenadores en Seguimiento
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Registra y gestiona coordinadores y técnicos de otros clubes con potencial de incorporación.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Column */}
        {isAdminOrScout ? (
          <Card className="glass-card lg:col-span-1 h-fit">
            <CardHeader className="border-b border-slate-900 pb-4">
              <CardTitle className="text-sm font-black uppercase text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                Añadir Entrenador
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Introduce los datos principales del técnico observado.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddCoach} className="space-y-4">
                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400">Nombre y Apellidos</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-550" />
                    <Input
                      placeholder="Ej. Roberto Gómez"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="bg-slate-900 border-slate-805 pl-9 text-white placeholder-slate-500 text-sm focus-visible:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Club */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans">Club de origen</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-550" />
                    <Input
                      placeholder="Ej. AD Arganda"
                      value={club}
                      onChange={(e) => setClub(e.target.value)}
                      className="bg-slate-900 border-slate-805 pl-9 text-white placeholder-slate-500 text-sm focus-visible:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Equipo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Equipo que entrena</label>
                    <Input
                      placeholder="Ej. Cadete A o Primer Equipo"
                      value={equipo}
                      onChange={(e) => setEquipo(e.target.value)}
                      className="bg-slate-900 border-slate-805 text-white placeholder-slate-550 text-sm focus-visible:ring-indigo-600"
                    />
                  </div>

                  {/* Categoria */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Categoría</label>
                    <Input
                      placeholder="Ej. Autonómica"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="bg-slate-900 border-slate-805 text-white placeholder-slate-550 text-sm focus-visible:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Edad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400">Edad</label>
                  <Input
                    type="number"
                    min="18"
                    max="99"
                    placeholder="Ej. 35 (Opcional)"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="bg-slate-900 border-slate-805 text-white placeholder-slate-550 text-sm focus-visible:ring-indigo-600"
                  />
                </div>

                {/* Observaciones */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400">Observaciones / Perfil táctico</label>
                  <Textarea
                    placeholder="Detalles sobre su estilo de juego, gestión grupal, licencia, trayectoria..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="bg-slate-900 border-slate-805 min-h-[90px] text-white placeholder-slate-500 text-sm focus-visible:ring-indigo-600"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 mt-2 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {saving ? 'Registrando...' : 'Registrar Entrenador'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card p-6 flex flex-col items-center justify-center text-center gap-4 h-fit">
            <ShieldAlert className="w-12 h-12 text-slate-500" />
            <div>
              <p className="font-bold text-slate-300">Modo Solo Lectura</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                Inicia sesión con tu rol de Scout o Admin para registrar perfiles de entrenadores.
              </p>
            </div>
          </Card>
        )}

        {/* Directory Listing Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtering and search */}
          <Card className="glass-card p-4 border border-slate-850 bg-slate-950/40">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar por candidato, equipo, categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border-slate-805 pl-9 text-slate-200 placeholder-slate-500 text-xs h-9 w-full"
                />
              </div>
              <div className="w-full sm:w-auto">
                <select
                  value={filterClub}
                  onChange={(e) => setFilterClub(e.target.value)}
                  className="bg-slate-900 border border-slate-805 text-white text-xs h-9 rounded-md px-3 py-1 w-full sm:w-[150px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Todos los clubes</option>
                  {uniqueClubs.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* List display */}
          <Card className="glass-card">
            <CardHeader className="pb-3 border-b border-slate-900 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black uppercase text-slate-200">
                  Candidatos Registrados ({filteredCoaches.length})
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Relación de entrenadores monitorizados por el club.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="py-12 text-center text-slate-400 animate-pulse text-sm">
                  Cargando perfiles de entrenadores...
                </div>
              ) : filteredCoaches.length === 0 ? (
                <div className="py-16 text-center text-slate-500 italic text-sm border border-dashed border-slate-850 rounded-xl bg-slate-950/10">
                  No se han encontrado entrenadores con la especificación indicada.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCoaches.map((coach) => {
                    const isEditing = editingId === coach.id;
                    return (
                      <div 
                        key={coach.id} 
                        className={`p-4 border rounded-xl transition-all duration-300 relative ${
                          isEditing 
                            ? 'bg-slate-905 border-indigo-500/50' 
                            : 'bg-slate-950/30 border-slate-850 hover:border-slate-805'
                        }`}
                      >
                        {isEditing ? (
                          /* Inline Edit Panel */
                          <div className="space-y-4">
                            <h4 className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-2">
                              <Pencil className="w-3.5 h-3.5" />
                              Editando Ficha de Entrenador
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {/* Name */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Nombre Completo</span>
                                <Input
                                  value={editingNombre}
                                  onChange={(e) => setEditingNombre(e.target.value)}
                                  className="h-8 py-1 bg-slate-900 border-slate-700 text-white text-xs"
                                />
                              </div>

                              {/* Club */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Club</span>
                                <Input
                                  value={editingClub}
                                  onChange={(e) => setEditingClub(e.target.value)}
                                  className="h-8 py-1 bg-slate-900 border-slate-700 text-white text-xs"
                                />
                              </div>

                              {/* Equipo */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Equipo que entrena</span>
                                <Input
                                  value={editingEquipo}
                                  onChange={(e) => setEditingEquipo(e.target.value)}
                                  className="h-8 py-1 bg-slate-900 border-slate-700 text-white text-xs"
                                />
                              </div>

                              {/* Categoría */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Categoría</span>
                                <Input
                                  value={editingCategoria}
                                  onChange={(e) => setEditingCategoria(e.target.value)}
                                  className="h-8 py-1 bg-slate-900 border-slate-700 text-white text-xs"
                                />
                              </div>

                              {/* Edad */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Edad</span>
                                <Input
                                  type="number"
                                  value={editingEdad}
                                  onChange={(e) => setEditingEdad(e.target.value)}
                                  className="h-8 py-1 bg-slate-900 border-slate-700 text-white text-xs"
                                />
                              </div>
                            </div>

                            {/* Observations */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Observaciones</span>
                              <Textarea
                                value={editingObservaciones}
                                onChange={(e) => setEditingObservaciones(e.target.value)}
                                className="bg-slate-900 border-slate-700 text-slate-200 text-xs min-h-[60px]"
                              />
                            </div>

                            <div className="flex items-center gap-2 justify-end pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={updating}
                                className="bg-transparent border-slate-800 text-slate-400 text-xs hover:text-white"
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateCoach(coach.id)}
                                disabled={updating}
                                className="bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                {updating ? 'Guardando...' : 'Guardar Cambios'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* View Coach Profile Card */
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                              <div>
                                <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                                  {coach.nombre}
                                  {coach.edad && (
                                    <span className="text-slate-500 text-sm font-normal">({coach.edad} años)</span>
                                  )}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <Badge className="bg-slate-900 text-indigo-400 font-black border border-indigo-500/20 text-[10px] rounded-md px-2 py-0.5 uppercase">
                                    {coach.club}
                                  </Badge>
                                  <Badge className="bg-slate-905 text-slate-300 font-bold border border-slate-800 text-[10px] rounded-md px-2 py-0.5">
                                    {coach.equipo} ({coach.categoria})
                                  </Badge>
                                </div>
                              </div>

                              {/* Authorized Actions */}
                              {isAdminOrScout && (
                                <div className="flex items-center gap-1">
                                  {deleteIdConfirmation === coach.id ? (
                                    <div className="flex items-center gap-1.5 bg-slate-900 border border-red-500/35 px-2 py-1 rounded-lg animate-in fade-in zoom-in duration-200">
                                      <span className="text-[10px] text-red-200 font-extrabold uppercase tracking-wide pr-1">¿Eliminar?</span>
                                      <Button 
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteCoach(coach.id)}
                                        className="h-7 px-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] rounded uppercase cursor-pointer transition-colors"
                                      >
                                        Sí
                                      </Button>
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDeleteIdConfirmation(null)}
                                        className="h-7 px-2 border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-[10px] rounded uppercase cursor-pointer"
                                      >
                                        No
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleStartEdit(coach)}
                                        className="h-8 w-8 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 cursor-pointer"
                                        title="Editar entrenador"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setDeleteIdConfirmation(coach.id)}
                                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                                        title="Eliminar entrenador"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Observations */}
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                              {coach.observaciones || 'Sin especificaciones o anotaciones registradas.'}
                            </p>

                            {/* Footer */}
                            <div className="flex flex-row items-center justify-between gap-1 text-[10px] text-slate-500 font-bold uppercase pt-1 border-t border-slate-950 mt-1">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-500/60" />
                                Scouting Entrenadores
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-650" />
                                {coach.created_at ? new Date(coach.created_at).toLocaleDateString() : 'Por defecto'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
