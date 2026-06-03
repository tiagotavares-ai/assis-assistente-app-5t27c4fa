import { useState } from "react";
import { ChevronDown, ChevronUp, FileBarChart } from "lucide-react";
import { useMaskValues } from "@/hooks/useMaskValues";
import type { useFinanceData } from "@/hooks/useFinanceData";

type Kind = "Entrada" | "Saída" | "Neutro";

function kindLabel(k: string, description: string | null): Kind {
  if (description?.toLowerCase().includes("estornada")) return "Neutro";
  if (k === "entrada") return "Entrada";
  if (k === "saida") return "Saída";
  return "Neutro";
}

function kindTone(k: Kind) {
  if (k === "Entrada") return "text-[var(--income)]";
  if (k === "Saída") return "text-destructive";
  return "text-muted-foreground";
}

export function RACReport({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const [open, setOpen] = useState(true);
  const { fmt } = useMaskValues();

  // Pega as movimentações do dia mais recente (até 8).
  const items = data.transactions.slice(0, 8);
  const walletById = (id: string) => data.wallets.find((w) => w.id === id);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-[var(--shadow-industrial)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition"
      >
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <FileBarChart className="h-3.5 w-3.5" />
          Relatório de Atualização Contínua · RAC
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border/60">
          <div className="grid grid-cols-[1.2fr_0.7fr_1.6fr_0.9fr] gap-2 px-4 py-2 text-[9px] uppercase tracking-wider text-muted-foreground bg-muted/30">
            <span>Balde</span>
            <span>Tipo</span>
            <span>Movimentação</span>
            <span className="text-right">Saldo</span>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-6 text-xs text-muted-foreground text-center">
              Nenhuma movimentação registrada ainda.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((t) => {
                const w = walletById(t.wallet_id);
                const k = kindLabel(t.kind, t.description);
                const tone = kindTone(k);
                const sign = k === "Entrada" ? "+" : k === "Saída" ? "−" : "·";
                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[1.2fr_0.7fr_1.6fr_0.9fr] gap-2 px-4 py-2 items-center text-xs"
                  >
                    <span className="font-medium truncate">{w?.name ?? "—"}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${tone}`}>{k}</span>
                    <span className="text-muted-foreground truncate">
                      <span className={`font-semibold ${tone}`}>{sign}{fmt(Number(t.amount))}</span>
                      {" · "}
                      <span className="text-foreground">{t.description ?? "—"}</span>
                    </span>
                    <span className="text-right tabular-nums font-bold">{fmt(Number(w?.balance ?? 0))}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
