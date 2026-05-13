import { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, Repeat, Trash2, Brush } from "lucide-react";
import { fmtBRL } from "@/lib/cycle";
import { useMaskValues } from "@/hooks/useMaskValues";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { useFinanceData } from "@/hooks/useFinanceData";

type Tx = ReturnType<typeof useFinanceData>["transactions"][number];

export function RecentActivity({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const [target, setTarget] = useState<Tx | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { fmt } = useMaskValues();

  const items = data.transactions.slice(0, 8);
  if (!items.length) return null;

  const walletName = (id: string) => data.wallets.find((w) => w.id === id)?.name ?? "—";

  const confirmDelete = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const wallet = data.wallets.find((w) => w.id === target.wallet_id);
      if (!wallet) throw new Error("Balde não encontrado");
      const amount = Number(target.amount);
      // Reversal: entrada -> subtract; saida -> add; alocacao -> no-op (ambiguous side)
      let delta = 0;
      if (target.kind === "entrada") delta = -amount;
      else if (target.kind === "saida") delta = amount;

      if (delta !== 0) {
        const newBalance = Number(wallet.balance) + delta;
        const { error: uErr } = await supabase
          .from("wallets").update({ balance: newBalance }).eq("id", wallet.id);
        if (uErr) throw uErr;
      }

      const { error: dErr } = await supabase
        .from("transactions").delete().eq("id", target.id);
      if (dErr) throw dErr;

      toast.success("Atividade apagada e saldo estornado");
      setTarget(null);
      await data.refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao apagar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Atividades Recentes
        </h2>
        <button
          onClick={() => setClearOpen(true)}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
          aria-label="Limpar histórico"
        >
          <Brush className="h-3 w-3" />
          Limpar Histórico
        </button>
      </div>
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
              <button
                onClick={() => setTarget(t)}
                className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                aria-label="Apagar atividade"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && !busy && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar atividade?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja apagar esta atividade e estornar o valor do saldo?
              {target && (
                <span className="block mt-2 text-foreground font-medium">
                  {target.description ?? target.kind} · {fmtBRL(Number(target.amount))}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Apagar e estornar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearOpen} onOpenChange={(o) => !o && !busy && setClearOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação apaga todos os registros visíveis de atividades.
              <span className="block mt-2 text-foreground font-medium">
                Os saldos dos baldes (Nubank, PicPay, Espécie) NÃO serão alterados.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const ids = items.map((i) => i.id);
                  const { error } = await supabase
                    .from("transactions").delete().in("id", ids);
                  if (error) throw error;
                  toast.success("Histórico limpo. Saldos preservados.");
                  setClearOpen(false);
                  await data.refetch();
                } catch (e: any) {
                  toast.error(e.message ?? "Erro ao limpar");
                } finally {
                  setBusy(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar histórico
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

