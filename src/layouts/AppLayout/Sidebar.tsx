import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Tags, 
  ListTree, 
  CarFront,
  Boxes,
  ArrowRightLeft,
  Building2,
  Users,
  ShoppingCart,
  Settings,
  Ruler,
  BadgeDollarSign
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { 
    label: 'Catálogo', 
    items: [
      { path: '/catalog/products', label: 'Productos', icon: PackageSearch },
      { path: '/catalog/categories', label: 'Categorías', icon: ListTree },
      { path: '/catalog/brands', label: 'Marcas', icon: Tags },
      { path: '/catalog/vehicles', label: 'Vehículos', icon: CarFront },
    ]
  },
  {
    label: 'Inventario',
    items: [
      { path: '/inventory/stock', label: 'Existencias', icon: Boxes },
      { path: '/inventory/movements', label: 'Movimientos', icon: ArrowRightLeft },
      { path: '/inventory/warehouses', label: 'Almacenes', icon: Building2 },
    ]
  },
  {
    label: 'Compras',
    items: [
      { path: '/purchases/suppliers', label: 'Proveedores', icon: Users, disabled: true },
      { path: '/purchases/orders', label: 'Órdenes de Compra', icon: ShoppingCart, disabled: true },
    ]
  },
  {
    label: 'Configuración',
    items: [
      { path: '/config/units', label: 'Unidades', icon: Ruler },
      { path: '/config/price-lists', label: 'Listas de Precios', icon: BadgeDollarSign },
      { path: '/config/attributes', label: 'Atributos', icon: Settings },
    ]
  }
];

export const Sidebar = () => {
  return (
    <aside className="w-[260px] bg-[#F5F5F7] flex flex-col h-full border-r border-gray-200/50">
      <div className="h-[3.25rem] flex items-center px-6">
        <h1 className="text-lg font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2">
          <Boxes className="w-[20px] h-[20px] text-[#0066CC]" />
          Mokada
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-4">
          {navItems.map((section, idx) => (
            <div key={idx} className="px-3">
              {section.items ? (
                <>
                  <h3 className="px-3 py-1.5 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                    {section.label}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavItem key={item.path} item={item} />
                    ))}
                  </div>
                </>
              ) : (
                <NavItem item={section} />
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

const NavItem = ({ item }: { item: any }) => {
  const Icon = item.icon;
  
  if (item.disabled) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-400 rounded-lg cursor-not-allowed">
        <Icon className="w-[16px] h-[16px]" />
        {item.label}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-[13px] ${
          isActive 
            ? 'bg-[#0066CC] text-white font-medium shadow-sm' 
            : 'text-[#1D1D1F] hover:bg-black/5'
        }`
      }
    >
      <Icon className="w-[16px] h-[16px]" />
      {item.label}
    </NavLink>
  );
};
