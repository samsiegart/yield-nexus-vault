import { create } from "zustand";

export type DataMode = "no-positions" | "has-positions" | "real-data";

export interface Position {
  id: string;
  allocationKey: string;
  protocol: string;
  name: string;
  apy: number;
  chain: string;
  value: number;
  percentage: number;
  targetPercentage: number;
  spread?: number;
}

export interface PortfolioData {
  currentBalance: number;
  totalDeposits: number;
  totalYield: number;
  weeklyReturn: number;
  positions: Position[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  dataMode: DataMode;
  isLoadingAprs: boolean;
  targetAllocations: Record<string, number>;
  portfolioOfferId: string | null;
}

interface PortfolioStore extends PortfolioData {
  // Actions
  setLoading: (loading: boolean) => void;
  setLoadingAprs: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPortfolioData: (
    data: Omit<PortfolioData, "isLoading" | "isLoaded" | "error">
  ) => void;
  setDataMode: (mode: DataMode) => void;
  reset: () => void;
  resetData: () => void;
  updatePosition: (positionId: string, updates: Partial<Position>) => void;
  addPosition: (position: Position) => void;
  removePosition: (positionId: string) => void;
  setPositions: (positions: Position[]) => void;
  setCurrentBalance: (balance: number) => void;
  setTargetAllocations: (allocations: Record<string, number>) => void;
  setPortfolioOfferId: (id: string | null) => void;
}

const initialState: PortfolioData = {
  currentBalance: 0,
  totalDeposits: 0,
  totalYield: 0,
  weeklyReturn: 0,
  positions: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  dataMode: "real-data",
  isLoadingAprs: false,
  targetAllocations: {},
  portfolioOfferId: null,
};

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  ...initialState,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setLoadingAprs: (loading: boolean) => set({ isLoadingAprs: loading }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  setPortfolioData: (data) =>
    set({
      ...data,
      isLoading: false,
      isLoaded: true,
      error: null,
    }),

  setDataMode: (mode: DataMode) => set({ dataMode: mode }),

  reset: () => set(initialState),

  resetData: () =>
    set((state) => ({
      ...initialState,
      dataMode: state.dataMode, // Preserve the current dataMode
    })),

  updatePosition: (positionId: string, updates: Partial<Position>) =>
    set((state) => ({
      positions: state.positions.map((pos) =>
        pos.id === positionId ? { ...pos, ...updates } : pos
      ),
    })),

  addPosition: (position: Position) =>
    set((state) => ({
      positions: [...state.positions, position],
    })),

  removePosition: (positionId: string) =>
    set((state) => ({
      positions: state.positions.filter((pos) => pos.id !== positionId),
    })),

  setPositions: (positions: Position[]) => set({ positions }),

  setCurrentBalance: (balance: number) => set({ currentBalance: balance }),

  setTargetAllocations: (allocations: Record<string, number>) =>
    set({ targetAllocations: allocations }),

  setPortfolioOfferId: (id: string | null) => set({ portfolioOfferId: id }),
}));
