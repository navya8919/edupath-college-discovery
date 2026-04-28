'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface CompareContextType {
  compareList: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>([]);

  const addToCompare = (id: string) => {
    if (compareList.length >= 3) return;
    if (!compareList.includes(id)) setCompareList((p) => [...p, id]);
  };

  const removeFromCompare = (id: string) => {
    setCompareList((p) => p.filter((x) => x !== id));
  };

  const clearCompare = () => setCompareList([]);
  const isInCompare = (id: string) => compareList.includes(id);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
