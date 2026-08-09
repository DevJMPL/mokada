import { useRouteOpsDashboard } from '../hooks/useRouteOperations';
import { LoadingState } from '../../../components/ui/LoadingState';
import { formatCurrency } from '../../../utils/formatters';
import { Link } from 'react-router-dom';
import { Route, Truck, Users, DollarSign, AlertCircle, ClipboardCheck, TrendingUp, TrendingDown } from 'lucide-react';

export const RouteOpsDashboardPage = () => {
  const { data: stats, isLoading } = useRouteOpsDashboard();

  if (isLoading) return <LoadingState message="Cargando dashboard..." />;

  const cards = [
    {
      label: 'Rutas activas',
      value: stats?.activeTrips || 0,
      icon: Route,
      color: 'bg-blue-50 text-blue-600',
      link: '/route-operations/trips',
    },
    {
      label: 'Agentes en ruta',
      value: stats?.agentsOnRoute || 0,
      icon: Users,
      color: 'bg-green-50 text-green-600',
      link: '/route-operations/trips',
    },
    {
      label: 'Pendientes de revisión',
      value: stats?.pendingReview || 0,
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-600',
      link: '/route-operations/trips',
    },
    {
      label: 'Pendientes de liquidar',
      value: stats?.pendingSettlements || 0,
      icon: ClipboardCheck,
      color: 'bg-purple-50 text-purple-600',
      link: '/route-operations/settlements',
    },
  ];

  const budgetUsed = stats?.totalBudget ? ((stats.totalExpenses / stats.totalBudget) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Operación en Ruta</h2>
        <p className="text-[15px] text-[#86868B]">Vista general de la operación semanal</p>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="group bg-white border border-gray-200/60 rounded-2xl p-5 hover:shadow-md hover:border-[#0066CC]/30 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">{card.value}</p>
            <p className="text-[13px] text-[#86868B] mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Financial overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[#86868B] mb-3">
            <DollarSign className="w-4 h-4" />
            <span className="text-[12px] font-medium uppercase tracking-wide">Presupuesto semanal</span>
          </div>
          <p className="text-[24px] font-bold text-[#1D1D1F]">{formatCurrency(stats?.totalBudget || 0)}</p>
          <p className="text-[13px] text-[#86868B] mt-1">{budgetUsed}% utilizado</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all ${Number(budgetUsed) > 100 ? 'bg-red-500' : 'bg-[#0066CC]'}`}
              style={{ width: `${Math.min(Number(budgetUsed), 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white border border-gray-200/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[#86868B] mb-3">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[12px] font-medium uppercase tracking-wide">Gastos registrados</span>
          </div>
          <p className="text-[24px] font-bold text-[#1D1D1F]">{formatCurrency(stats?.totalExpenses || 0)}</p>
          <p className="text-[13px] text-amber-600 mt-1">Pendientes: {formatCurrency(stats?.pendingExpenses || 0)}</p>
        </div>
        <div className="bg-white border border-gray-200/60 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[#86868B] mb-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[12px] font-medium uppercase tracking-wide">Unidades asignadas</span>
          </div>
          <p className="text-[24px] font-bold text-[#1D1D1F]">{stats?.activeTrips || 0}</p>
          <p className="text-[13px] text-[#86868B] mt-1">vehículos en operación</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/fleet/vehicles" className="flex items-center gap-3 bg-white border border-gray-200/60 rounded-xl p-4 hover:shadow-sm hover:border-[#0066CC]/30 transition-all">
          <Truck className="w-5 h-5 text-[#0066CC]" />
          <span className="text-[14px] font-medium text-[#1D1D1F]">Flotilla</span>
        </Link>
        <Link to="/route-operations/routes" className="flex items-center gap-3 bg-white border border-gray-200/60 rounded-xl p-4 hover:shadow-sm hover:border-[#0066CC]/30 transition-all">
          <Route className="w-5 h-5 text-[#0066CC]" />
          <span className="text-[14px] font-medium text-[#1D1D1F]">Rutas</span>
        </Link>
        <Link to="/route-operations/trips" className="flex items-center gap-3 bg-white border border-gray-200/60 rounded-xl p-4 hover:shadow-sm hover:border-[#0066CC]/30 transition-all">
          <Users className="w-5 h-5 text-[#0066CC]" />
          <span className="text-[14px] font-medium text-[#1D1D1F]">Viajes</span>
        </Link>
        <Link to="/route-operations/settlements" className="flex items-center gap-3 bg-white border border-gray-200/60 rounded-xl p-4 hover:shadow-sm hover:border-[#0066CC]/30 transition-all">
          <ClipboardCheck className="w-5 h-5 text-[#0066CC]" />
          <span className="text-[14px] font-medium text-[#1D1D1F]">Liquidaciones</span>
        </Link>
      </div>
    </div>
  );
};
