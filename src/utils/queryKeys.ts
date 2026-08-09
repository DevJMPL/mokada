export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

export const catalogKeys = {
  all: ['catalog'] as const,
  products: (filters?: any) => [...catalogKeys.all, 'products', filters] as const,
  product: (id: string) => [...catalogKeys.all, 'product', id] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  brands: () => [...catalogKeys.all, 'brands'] as const,
  vehicles: () => [...catalogKeys.all, 'vehicles'] as const,
};

export const inventoryKeys = {
  all: ['inventory'] as const,
  stock: (filters?: any) => [...inventoryKeys.all, 'stock', filters] as const,
  movements: (filters?: any) => [...inventoryKeys.all, 'movements', filters] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
};

export const configKeys = {
  all: ['config'] as const,
  units: () => [...configKeys.all, 'units'] as const,
  priceLists: () => [...configKeys.all, 'priceLists'] as const,
  attributes: () => [...configKeys.all, 'attributes'] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
};
