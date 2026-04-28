import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { OverlayKey, TabKey } from '../types';

interface NavigationContextValue {
  activeTab: TabKey;
  overlay: OverlayKey;
  pendingSearchQuery: string;
  setTab: (tab: TabKey) => void;
  triggerSearch: (query: string) => void;
  consumeSearchQuery: () => string;
  openOverlay: (overlay: Exclude<OverlayKey, null>) => void;
  closeOverlay: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [overlay, setOverlay] = useState<OverlayKey>(null);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');

  const value = useMemo<NavigationContextValue>(() => ({
    activeTab,
    overlay,
    pendingSearchQuery,
    setTab: (tab) => setActiveTab(tab),
    triggerSearch: (query) => {
      setPendingSearchQuery(query);
      setActiveTab('search');
    },
    consumeSearchQuery: () => {
      const nextQuery = pendingSearchQuery;
      setPendingSearchQuery('');
      return nextQuery;
    },
    openOverlay: (nextOverlay) => setOverlay(nextOverlay),
    closeOverlay: () => setOverlay(null),
  }), [activeTab, overlay, pendingSearchQuery]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};