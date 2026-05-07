import { useState } from "react";
import { ArrowDownToLine, Landmark, HandCoins, Split, Cpu } from "lucide-react";
import { fmtBRL } from "@/lib/cycle";
import { postTransaction } from "@/lib/finance";
import type { useFinanceData } from "@/hooks/useFinanceData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Source = "INSS" | "Ajuda" | "TechHub";

export function IncomeTab({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const [source, setSource] = useState<Source>("INSS");
  const [total, setTotal] = useState("");
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [techPurpose, setTechPurpose] = useState<"Imprevistos" | "Socorro ao Lar">("Imprevistos");

  const totalNum = Number(total) || 0;
  const allocSum = Object.values(allocations).reduce((s, v) => s + (Number(v) || 0), 0);
  const remaining = totalNum - allocSum;

  const setAlloc = (id: string, v: string) =>
    setAllocations((p) => ({ ...p, [id]: v }));

  const distributeEqually = () => {
    if (!totalNum) return;
    const per = (totalNum / data.wallets.length).toFixed(2);
    const next: Record<string, string> = {};
    data.wallets.forEach((w) => (next[w.id] = per));
    setAllocations(next);
  };

  const submit = async () => {
    if (totalNum <= 0) return toast.error("Informe o valor da entrada");
    if (Math.abs(remaining) > 0.01)
      return toast.error(`Aloque exatamente ${fmtBRL(totalNum)} (restam ${fmtBRL(remaining)})`);

    setSubmitting(true);
    try {
      for (const w of data.wallets) {
        const v = Number(allocations[w.id] || 0);
        if (v > 0) {
          await postTransaction({
            walletId: w.id, amount: v, kind: "entrada", delta: v,
            description: `Entrada ${source}`, source,
          });
        }
      }
      toast.success("Entrada registrada");
      setTotal(""); setAllocations({});
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section
        className="rounded-2xl p-5 border border-[var(--income)]/30 text-white"
        style={{ background: "var(--gradient-income)" }}
      >
        <div className="flex items-center gap-1.5 text-white/85 text-[10px] tracking-[0.25em] uppercase">
          <ArrowDownToLine className="h-3 w-3" /> Registrar Entrada
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight">{fmtBRL(totalNum)}</div>
        <div className="mt-1 text-[11px] opacity-80">Bruto a alocar</div>
      </section>

      {/* Source */}
      <div className="grid grid-cols-2 gap-2">
        <SourceBtn active={source === "INSS"} onClick={() => setSource("INSS")} icon={Landmark} label="Salário INSS" />
        <SourceBtn active={source === "Ajuda"} onClick={() => setSource("Ajuda")} icon={HandCoins} label="Ajudas" />
      </div>

      {/* Total input */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Valor Recebido
        </label>
        <Input
          type="number" inputMode="decimal" placeholder="0,00"
          value={total} onChange={(e) => setTotal(e.target.value)}
          className="text-2xl font-bold h-14"
        />
      </div>

      {/* Allocation */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Alocação Manual
          </h2>
          <button onClick={distributeEqually} className="text-[10px] uppercase tracking-wider text-primary flex items-center gap-1">
            <Split className="h-3 w-3" /> Dividir igual
          </button>
        </div>

        {data.wallets.map((w) => (
          <div key={w.id} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">{w.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {w.category === "sobrevivencia" ? "Sobrevivência" : "Estrutural"}
              </div>
            </div>
            <Input
              type="number" inputMode="decimal" placeholder="0,00"
              value={allocations[w.id] || ""} onChange={(e) => setAlloc(w.id, e.target.value)}
              className="w-28 text-right tabular-nums"
            />
          </div>
        ))}

        <div className={`flex justify-between text-xs pt-2 border-t border-border ${
          Math.abs(remaining) < 0.01 ? "text-[var(--income)]" : "text-muted-foreground"
        }`}>
          <span>Restante a alocar</span>
          <span className="font-bold tabular-nums">{fmtBRL(remaining)}</span>
        </div>
      </div>

      <Button onClick={submit} disabled={submitting} className="w-full h-12 text-base font-semibold">
        {submitting ? "Processando…" : "Confirmar Entrada"}
      </Button>
    </div>
  );
}

function SourceBtn({
  active, onClick, icon: Icon, label,
}: { active: boolean; onClick: () => void; icon: typeof Landmark; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3 flex flex-col items-center gap-1 transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
