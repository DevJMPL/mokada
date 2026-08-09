import { Link } from 'react-router-dom';
import { Ruler, BadgeDollarSign, Settings as SettingsIcon, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../auth/context/useAuth';

export const ConfigurationPage = () => {
  const { isAdmin } = useAuth();

  const configModules = [
    {
      title: 'Unidades de Medida',
      description: 'Gestión de unidades para inventario y productos.',
      icon: Ruler,
      path: '/config/units',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Listas de Precios',
      description: 'Configuración de niveles de precios y descuentos especiales.',
      icon: BadgeDollarSign,
      path: '/config/price-lists',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Atributos Dinámicos',
      description: 'Definición de características configurables para productos.',
      icon: SettingsIcon,
      path: '/config/attributes',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  if (isAdmin) {
    configModules.push({
      title: 'Usuarios y Permisos',
      description: 'Gestión de accesos y roles del sistema.',
      icon: ShieldCheck,
      path: '/admin/users',
      color: 'bg-orange-50 text-orange-600',
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Configuración del Sistema</h2>
        <p className="text-[15px] text-[#86868B] mt-1">Administra los catálogos base, preferencias y seguridad de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configModules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className="group flex flex-col p-6 bg-white border border-gray-200/60 rounded-2xl hover:shadow-md hover:border-[#0066CC]/30 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${module.color}`}>
              <module.icon className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#1D1D1F] mb-2 group-hover:text-[#0066CC] transition-colors flex items-center justify-between">
              {module.title}
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-[#0066CC]" />
            </h3>
            <p className="text-[14px] text-[#86868B] leading-relaxed flex-1">
              {module.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
