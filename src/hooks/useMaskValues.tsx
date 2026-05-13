import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fmtBRL } from "@/lib/cycle";

type Ctx = {
  masked: boolean;
  toggle: () => void;
  fmt: (v: number) => string;
};

const MaskCtx = createContext<Ctx | null>(null);
const KEY = "assis.maskValues";

export function MaskValuesProvider({ children }: { children: ReactNode }) {
  const [masked, setMasked] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "1") setMasked(true);
    } catch { /* noop */ }
  }, []);

  const toggle = useCallback(() => {
    setMasked((m) => {
      const next = !m;
      try { localStorage.setItem(KEY, next ? "1" : "0"); } catch { /* noop */ }
      return next;
    });
  }, []);

  const fmt = useCallback((v: number) => (masked ? "R$ ••••" : fmtBRL(v)), [masked]);

  return <MaskCtx.Provider value={{ masked, toggle, fmt }}>{children}</MaskCtx.Provider>;
}

export function useMaskValues(): Ctx {
  const ctx = useContext(MaskCtx);
  if (!ctx) {
    // Fallback seguro (sem provider): exibe valores reais.
    return { masked: false, toggle: () => {}, fmt: fmtBRL };
  }
  return ctx;
}
