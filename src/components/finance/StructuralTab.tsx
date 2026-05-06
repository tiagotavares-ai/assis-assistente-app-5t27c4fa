import { useState } from "react";
import { Building2, Plus, Trash2, Check } from "lucide-react";
import { fmtBRL } from "@/lib/cycle";
import { supabase } from "@/integrations/supabase/client";
import type { useFinanceData } from "@/hooks/useFinanceData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function StructuralTab({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const nubank = data.get("Nubank");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("5");
  const [adding, setAdding] = useState(false);

  const totalFixed = data.fixed.reduce((s, f) => s + Number(f.amount), 0);
  const paidFixed = data.fixed.filter((f) => f.paid).reduce((s, f) => s + Number(f.amount), 0);

  const addAccount = async () => {
    if (!name || !amount) return toast.error("Preencha nome e valor");
    setAdding(true);
    const { error } = await supabase.from("fixed_accounts").insert({
      name, amount: Number(amount), due_day: Number(day) || 1,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setName(""); setAmount(""); setDay("5");
    toast.success("Conta cadastrada");
  };

  const togglePaid = async (id: string, paid: boolean) => {
    await supabase.from("fixed_accounts").update({ paid: !paid }).eq("id", id);
  };
  const remove = async (id: string) => {
    await supabase.from("fixed_accounts").delete().eq("id", id);
    toast.success("Conta removida");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Nubank card */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 border border-[var(--structural)]/30"
        style={{ background: "var(--gradient-structural)" }}
      >
        <div className="flex items-center gap-1.5 text-white/80 text-[10px] tracking-[0.25em] uppercase">
          <Building2 className="h-3 w-3" /> Reserva Estrutural
        </div>
        <div className="mt-3 text-white">
          <div className="text-[11px] uppercase tracking-wider opacity-80">Nubank</div>
          <div className="text-4xl font-bold tracking-tight">{fmtBRL(nubank?.balance ?? 0)}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-white text-xs">
          <Stat label="Compromissos" value={fmtBRL(totalFixed)} />
          <Stat label="Pagos" value={fmtBRL(paidFixed)} />
        </div>
      </section>

      {/* Add */}
      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Nova Conta Fixa
        </h2>
        <Input placeholder="Nome (ex: Aluguel)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" inputMode="decimal" placeholder="Valor" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input type="number" inputMode="numeric" placeholder="Dia venc." value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        <Button onClick={addAccount} disabled={adding} className="w-full">
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </section>

      {/* List */}
      <section className="space-y-2">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground px-1">
          Compromissos Mensais
        </h2>
        {data.fixed.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-6 border border-dashed border-border rounded-xl">
            Nenhuma conta cadastrada
          </div>
        )}
        {data.fixed.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <button
              onClick={() => togglePaid(f.id, f.paid)}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition ${
                f.paid ? "bg-[var(--income)]/20 text-[var(--income)]" : "bg-muted text-muted-foreground"
              }`}
            >
              <Check className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate ${f.paid ? "line-through opacity-60" : ""}`}>
                {f.name}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Vence dia {f.due_day}
              </div>
            </div>
            <div className="text-sm font-bold tabular-nums">{fmtBRL(Number(f.amount))}</div>
            <button onClick={() => remove(f.id)} className="text-muted-foreground hover:text-destructive p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/20 p-2.5">
      <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}
