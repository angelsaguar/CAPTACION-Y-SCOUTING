import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getObservers, addObserver, deleteObserver } from '@/lib/observers';
import { Observer } from '@/types';
import { Users, Plus, Trash2, Shield, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Observers() {
  const [observers, setObservers] = useState<Observer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newObsName, setNewObsName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadObservers() {
      try {
        const data = await getObservers();
        setObservers(data);
      } catch (err) {
        toast.error('Error al cargar la lista de observadores');
      } finally {
        setLoading(false);
      }
    }
    loadObservers();
  }, []);

  const handleAddObserver = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newObsName.trim();
    if (!trimmed) {
      toast.error('El nombre del observador no puede estar vacío');
      return;
    }

    setSaving(true);
    try {
      const created = await addObserver(trimmed);
      setObservers(prev => [...prev.filter(o => o.id !== created.id), created].sort((a,b) => a.nombre.localeCompare(b.nombre)));
      setNewObsName('');
      toast.success(`Observador "${created.nombre}" registrado correctamente`);
    } catch (err: any) {
      toast.error(err.message || 'No se pudo guardar el observador');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteObserver = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al scouter "${name}"? No borrará informes de jugadores ya asignados.`)) return;
    
    try {
      const success = await deleteObserver(id);
      if (success) {
        setObservers(prev => prev.filter(o => o.id !== id));
        toast.success('Observador eliminado de la lista');
      } else {
        toast.error('No se pudo eliminar el observador');
      }
    } catch (err) {
      toast.error('Error al intentar eliminar');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Directorio de Scouters</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestiona el equipo de observadores y analistas de la UD La Poveda.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Registration Card */}
        <Card className="glass-card md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-black uppercase text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Alta de Scouter
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Registra un nuevo analista/observador para el club.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddObserver} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Nombre Completo</label>
                <Input
                  placeholder="Ej. Ángel Saguar"
                  value={newObsName}
                  onChange={(e) => setNewObsName(e.target.value)}
                  className="bg-slate-900 border-slate-805 text-white placeholder-slate-500 text-sm"
                />
              </div>
              <Button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                {saving ? 'Registrando...' : 'Registrar Scouter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Directory Listing */}
        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black uppercase text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Scouters Registrados ({observers.length})
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Lista de observadores activos disponibles para asignar a informes de jugadores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-400 animate-pulse text-sm">
                Cargando directorio de scouters...
              </div>
            ) : observers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 italic text-sm border-2 border-dashed border-slate-800 rounded-xl">
                No hay scouters registrados. Utiliza el formulario lateral para dar de alta al primero.
              </div>
            ) : (
              <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/20">
                <Table>
                  <TableHeader className="bg-slate-950/40">
                    <TableRow className="border-slate-805 hover:bg-transparent">
                      <TableHead className="text-slate-500 font-bold uppercase text-[10px] py-3">Nombre del Scouter</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase text-[10px] py-3">F. de Registro</TableHead>
                      <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px] py-3">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {observers.map((obs) => (
                      <TableRow key={obs.id} className="border-slate-805 hover:bg-slate-900/30">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">
                              {obs.nombre.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-200 text-sm">{obs.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-slate-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {obs.created_at ? new Date(obs.created_at).toLocaleDateString() : 'Por defecto'}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteObserver(obs.id, obs.nombre)}
                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/20"
                            title="Eliminar Scouter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
