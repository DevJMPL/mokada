import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RouteState {
  globalSelectedRouteId: string;
  setGlobalSelectedRouteId: (id: string) => void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      globalSelectedRouteId: '',
      setGlobalSelectedRouteId: (id) => set({ globalSelectedRouteId: id }),
    }),
    {
      name: 'global-route-storage',
    }
  )
);
