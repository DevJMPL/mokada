import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';

import { DashboardPage } from '../../modules/dashboard/pages/DashboardPage';
import { ProductsPage } from '../../modules/catalog/pages/ProductsPage';
import { ProductFormPage } from '../../modules/catalog/pages/ProductFormPage';
import { CategoriesPage } from '../../modules/catalog/pages/CategoriesPage';
import { BrandsPage } from '../../modules/catalog/pages/BrandsPage';
import { VehiclesPage } from '../../modules/catalog/pages/VehiclesPage';

import { StockPage } from '../../modules/inventory/pages/StockPage';
import { MovementsPage } from '../../modules/inventory/pages/MovementsPage';
import { WarehousesPage } from '../../modules/inventory/pages/WarehousesPage';
import { TransfersPage } from '../../modules/inventory/pages/TransfersPage';
import { TransferFormPage } from '../../modules/inventory/pages/TransferFormPage';

import { UnitsPage } from '../../modules/configuration/pages/UnitsPage';
import { PriceListsPage } from '../../modules/configuration/pages/PriceListsPage';
import { AttributesPage } from '../../modules/configuration/pages/AttributesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'catalog',
        children: [
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/:id', element: <ProductFormPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'brands', element: <BrandsPage /> },
          { path: 'vehicles', element: <VehiclesPage /> },
        ]
      },
      {
        path: 'inventory',
        children: [
          { path: 'stock', element: <StockPage /> },
          { path: 'movements', element: <MovementsPage /> },
          { path: 'warehouses', element: <WarehousesPage /> },
          { path: 'transfers', element: <TransfersPage /> },
          { path: 'transfers/new', element: <TransferFormPage /> },
        ]
      },
      {
        path: 'config',
        children: [
          { path: 'units', element: <UnitsPage /> },
          { path: 'price-lists', element: <PriceListsPage /> },
          { path: 'attributes', element: <AttributesPage /> },
        ]
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);
