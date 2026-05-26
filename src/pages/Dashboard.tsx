import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ChevronRight,
  Plus,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Player } from '@/types';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#7c3aed', '#db2777'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    byPosition: [] as any[],
    recentPlayers: [] as Player[],
    byStatus: [] as any[],
    newThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // In a real app we would use a RPC but for now let's query
        const { data: players } = await supabase
          .from('players')
          .select('*')
          .order('created_at', { ascending: false });

        if (players) {
          const positions = players.reduce((acc: any, p) => {
            acc[p.posicion] = (acc[p.posicion] || 0) + 1;
            return acc;
          }, {});

          const status = players.reduce((acc: any, p) => {
            acc[p.estado] = (acc[p.estado] || 0) + 1;
            return acc;
          }, {});

          // Calculemos los nuevos de este mes.
          const now = new Date();
          const currentMonth = now.getMonth(); // 0-11
          const currentYear = now.getFullYear();

          const newThisMonthCount = players.filter(p => {
            if (!p.created_at) return false;
            const pDate = new Date(p.created_at);
            return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
          }).length;

          setStats({
            total: players.length,
            byPosition: Object.entries(positions).map(([name, value]) => ({ name, value })),
            byStatus: Object.entries(status).map(([name, value]) => ({ name, value })),
            recentPlayers: players.slice(0, 5),
            newThisMonth: newThisMonthCount
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getStatusCount = (statusName: string) => {
    const found = stats.byStatus.find(s => s.name?.trim().toLowerCase() === statusName.toLowerCase());
    return found ? found.value : 0;
  };

  const kpis = [
    { label: 'Observado', value: getStatusCount('Observado'), icon: Eye, color: 'text-zinc-400', barColor: 'bg-zinc-400' },
    { label: 'En seguimiento', value: getStatusCount('En seguimiento'), icon: Target, color: 'text-amber-500', barColor: 'bg-amber-500' },
    { label: 'Interesa', value: getStatusCount('Interesa'), icon: TrendingUp, color: 'text-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Fichado', value: getStatusCount('Fichado'), icon: UserCheck, color: 'text-blue-500', barColor: 'bg-blue-500' },
    { label: 'Rechazado', value: getStatusCount('Rechazado'), icon: UserX, color: 'text-red-500', barColor: 'bg-red-500' },
  ];

  const totalCount = stats.total;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white italic">Panel de Control</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Resumen de captación y seguimiento de prospectos.</p>
        </div>
        <Link to="/players/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 rounded-full font-bold shadow-lg shadow-red-900/30">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Jugador
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi, i) => {
          const percentage = totalCount > 0 ? Math.round((kpi.value / totalCount) * 100) : 0;
          return (
            <Card key={i} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{kpi.label}</CardTitle>
                <div className="bg-slate-800/50 p-1.5 rounded-lg">
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-black text-white italic tracking-tighter">{kpi.value}</div>
                  {totalCount > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-500 mb-1">
                      {percentage}%
                    </span>
                  )}
                </div>
                <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full", kpi.barColor)} style={{ width: `${percentage}%` }}></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="lg:col-span-4 premium-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Rendimiento por Posición</CardTitle>
            <CardDescription className="text-slate-500">Métricas clave detectadas este mes</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byPosition}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(51, 65, 85, 0.3)'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 premium-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Distribución de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                {stats.byStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-white italic">Actividad en Vivo</CardTitle>
            <Link to="/players" className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Ver todo</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPlayers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">No hay registros recientes</div>
              ) : (
                stats.recentPlayers.map((player) => (
                  <Link 
                    key={player.id} 
                    to={`/players/${player.id}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30 border border-slate-800 hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold overflow-hidden border border-blue-500/20">
                        {player.foto_url ? (
                          <img src={player.foto_url} alt={player.nombre} className="w-full h-full object-cover" />
                        ) : (
                          player.nombre.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {player.nombre} {player.apellidos}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                          {player.posicion} • {player.equipo_actual}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-slate-600">
                        {player.created_at && format(new Date(player.created_at), 'd MMM', { locale: es })}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white tracking-tight">Próximos Seguimientos</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-600 bg-slate-800/50 rounded-r-2xl">
                  <p className="text-sm font-bold text-white truncate">Seguimiento Torneo Regional</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-blue-500 mt-1">Mañana, 10:00 AM</p>
                </div>
                <div className="p-4 border-l-4 border-red-600 bg-slate-800/50 rounded-r-2xl">
                  <p className="text-sm font-bold text-white truncate">Revisión de informes pendientes</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-red-500 mt-1">Jueves, 05:00 PM</p>
                </div>
                <div className="p-4 border-l-4 border-green-600 bg-slate-800/50 rounded-r-2xl">
                  <p className="text-sm font-bold text-white truncate">Reunión equipo de captación</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-green-500 mt-1">Viernes, 11:00 AM</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
