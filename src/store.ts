import { create } from "zustand";

export interface Position {
  id: string;
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
}

interface PortfolioStore extends PortfolioData {
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPortfolioData: (
    data: Omit<PortfolioData, "isLoading" | "isLoaded" | "error">
  ) => void;
  reset: () => void;
  updatePosition: (positionId: string, updates: Partial<Position>) => void;
  addPosition: (position: Position) => void;
  removePosition: (positionId: string) => void;
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
};

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  ...initialState,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  setPortfolioData: (data) =>
    set({
      ...data,
      isLoading: false,
      isLoaded: true,
      error: null,
    }),

  reset: () => set(initialState),

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
}));
