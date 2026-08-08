import { Package, Tags, ListTree, Building2, AlertTriangle, XCircle } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';

export const DashboardPage = () => {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) return <LoadingState message="Cargando resumen..." />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const statCards = [
    { title: 'Productos Totales', value: stats?.productsCount, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Marcas', value: stats?.brandsCount, icon: Tags, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Categorías', value: stats?.categoriesCount, icon: ListTree, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Almacenes', value: stats?.warehousesCount, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Bajo Stock', value: stats?.lowStockCount, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Agotados', value: stats?.outOfStockCount, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h4 className="text-2xl font-bold text-slate-800">{stat.value || 0}</h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
