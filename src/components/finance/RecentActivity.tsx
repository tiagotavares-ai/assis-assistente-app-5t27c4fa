import { ArrowUpCircle, ArrowDownCircle, Repeat } from "lucide-react";
import { fmtBRL } from "@/lib/cycle";
import type { useFinanceData } from "@/hooks/useFinanceData";

export function RecentActivity({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const items = data.transactions.slice(0, 8);
  if (!items.length) return null;

  const walletName = (id: string) => data.wallets.find((w) => w.id === id)?.name ?? "—";

  return (
    <section className="space-y-2">
      <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground px-1">
        Atividades Recentes
      </h2>
      <div className="rounded-xl border border-border bg-card divide-y divide-border/60">
        {items.map((t) => {
          const isEntrada = t.kind === "entrada";
          const isAloc = t.kind === "alocacao";
          const Icon = isAloc ? Repeat : isEntrada ? ArrowUpCircle : ArrowDownCircle;
          const color = isAloc
            ? "text-muted-foreground"
            : isEntrada ? "text-[var(--income)]" : "text-destructive";
          const sign = isAloc ? "" : isEntrada ? "+" : "−";
          const date = new Date(t.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
          });
          return (
            <div key={t.id} className="flex items-center gap-3 p-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-muted ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {t.description ?? (isEntrada ? "Entrada" : "Saída")}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                  {walletName(t.wallet_id)}{t.category ? ` · ${t.category}` : ""} · {date}
                </div>
              </div>
              <div className={`text-sm font-bold tabular-nums ${color}`}>
                {sign}{fmtBRL(Number(t.amount))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
