import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { User, Observer } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, Trash2, Mail, Key, UserCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getObservers, addObserver, deleteObserver } from '@/lib/observers';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [observers, setObservers] = useState<Observer[]>([]);
  const [loading, setLoading] = useState(true);

  // States for observer management form
  const [newObsName, setNewObsName] = useState('');
  const [savingObs, setSavingObs] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: usersData } = await supabase.from('users').select('*');
        if (usersData) setUsers(usersData);

        const observersList = await getObservers();
        setObservers(observersList);
      } catch (err) {
        console.error('Failed to load initial admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddObserver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsName.trim()) {
      toast.error('Por favor escribe un nombre para el observador');
      return;
    }
    setSavingObs(true);
    try {
      const created = await addObserver(newObsName.trim());
      setObservers(prev => [...prev.filter(o => o.id !== created.id), created].sort((a,b) => a.nombre.localeCompare(b.nombre)));
      setNewObsName('');
      toast.success('Observador registrado con éxito');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar observador');
    } finally {
      setSavingObs(false);
    }
  };

  const handleDeleteObserver = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este observador? No afectará a informes de jugadores existentes.')) return;
    try {
      const success = await deleteObserver(id);
      if (success) {
        setObservers(prev => prev.filter(o => o.id !== id));
        toast.success('Observador eliminado');
      } else {
        toast.error('No se pudo eliminar el observador');
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const registrationKey = import.meta.env.VITE_REGISTRATION_KEY || 'lapoveda_secret_2026';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración</h1>
          <p className="text-muted-foreground">Gestión de usuarios y permisos del sistema.</p>
        </div>
        <Button className="bg-slate-900">
          <UserPlus className="w-4 h-4 mr-2" />
          Invitar Scout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-widest">Scouts Activos</CardTitle>
            <Shield className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-widest">Clave de Registro de analistas</CardTitle>
            <Key className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <p className="text-xl font-mono font-bold text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg inline-block select-all">
                {registrationKey}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Comparte esta clave con otros analistas para que puedan registrarse en la aplicación.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de alta</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm mt-6">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Directorio de Observadores / Scouts</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Da de alta nuevos observadores para que se puedan seleccionar al dar de alta un jugador.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAddObserver} className="flex gap-3 max-w-md bg-slate-900/20 p-1.5 rounded-xl border border-slate-800">
            <Input
              placeholder="Nombre del nuevo observador..."
              value={newObsName}
              onChange={(e) => setNewObsName(e.target.value)}
              className="bg-transparent border-none text-white focus-visible:ring-0 text-sm"
            />
            <Button type="submit" disabled={savingObs} className="bg-blue-600 hover:bg-blue-500 font-bold shrink-0 rounded-lg">
              <Plus className="w-4 h-4 mr-1.5" /> Registrar
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Observador</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-500 italic">
                    No hay observadores de alta todavía. Registra uno arriba.
                  </TableCell>
                </TableRow>
              ) : (
                observers.map((obs) => (
                  <TableRow key={obs.id}>
                    <TableCell className="font-semibold text-slate-200">{obs.nombre}</TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {obs.created_at ? new Date(obs.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-950/20 rounded-lg hover:text-red-400"
                        onClick={() => handleDeleteObserver(obs.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
