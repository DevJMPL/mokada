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
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
          <Boxes className="w-6 h-6 text-blue-500" />
          MOKADA
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6">
          {navItems.map((section, idx) => (
            <div key={idx} className="px-4">
              {section.items ? (
                <>
                  <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {section.label}
                  </h3>
                  <div className="space-y-1">
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
      <div className="flex items-center gap-3 px-2 py-2 text-sm text-slate-600 rounded-md cursor-not-allowed">
        <Icon className="w-4 h-4" />
        {item.label}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-sm ${
          isActive 
            ? 'bg-blue-600 text-white font-medium' 
            : 'hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      {item.label}
    </NavLink>
  );
};
