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

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters?: any) => [...customerKeys.all, 'list', filters] as const,
  detail: (customerId?: string | null) => [...customerKeys.all, 'detail', customerId] as const,
  fiscalProfiles: (customerId?: string | null) => [...customerKeys.all, 'fiscalProfiles', customerId] as const,
  branches: (customerId?: string | null) => [...customerKeys.all, 'branches', customerId] as const,
  branchOptions: () => [...customerKeys.all, 'branchOptions'] as const,
  routes: () => [...customerKeys.all, 'routes'] as const,
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

export const fleetKeys = {
  all: ['fleet'] as const,
  vehicles: () => [...fleetKeys.all, 'vehicles'] as const,
  vehicle: (id: string) => [...fleetKeys.all, 'vehicle', id] as const,
};

export const routeKeys = {
  all: ['routes'] as const,
  routes: () => [...routeKeys.all, 'list'] as const,
  route: (id: string) => [...routeKeys.all, 'detail', id] as const,
  trips: (filters?: any) => [...routeKeys.all, 'trips', filters] as const,
  trip: (id: string) => [...routeKeys.all, 'trip', id] as const,
  myTrip: () => [...routeKeys.all, 'my-trip'] as const,
};

export const expenseKeys = {
  all: ['expenses'] as const,
  categories: () => [...expenseKeys.all, 'categories'] as const,
  tripExpenses: (tripId: string) => [...expenseKeys.all, 'trip', tripId] as const,
};

export const settlementKeys = {
  all: ['settlements'] as const,
  list: (filters?: any) => [...settlementKeys.all, 'list', filters] as const,
  detail: (id: string) => [...settlementKeys.all, 'detail', id] as const,
  financialSummary: (filters?: any) => [...settlementKeys.all, 'financial', filters] as const,
};

export const routeOpsKeys = {
  all: ['route-ops'] as const,
  dashboard: () => [...routeOpsKeys.all, 'dashboard'] as const,
};
