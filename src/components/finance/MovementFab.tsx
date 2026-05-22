import { useMemo, useState } from "react";
import { Plus, ArrowUpCircle, ArrowDownCircle, ShieldAlert } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { postTransaction } from "@/lib/finance";
import type { useFinanceData } from "@/hooks/useFinanceData";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES, TECH_HUB_CATEGORY } from "@/lib/categories";
import { classifyLevel, getCurrentCycle } from "@/lib/cycle";

export function MovementFab({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"entrada" | "saida">("saida");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<string>("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].value);
  const [busy, setBusy] = useState(false);

  // Avalia nível de sobrevivência atual (líquido / dias restantes).
  const { isBronze } = useMemo(() => {
    const caixa   = (data.get("Caixa")?.balance ?? data.get("PicPay")?.balance) ?? 0;
    const especie = data.get("Espécie")?.balance ?? 0;
    const cycle = getCurrentCycle();
    const perDay = (caixa + especie) / cycle.daysRemaining;
    return { isBronze: classifyLevel(perDay) === "bronze" };
  }, [data]);

  const techHubBlocked = isBronze && kind === "saida" && category === TECH_HUB_CATEGORY;

  const reset = () => {
    setDesc(""); setAmount(""); setWalletId(""); setCategory(EXPENSE_CATEGORIES[0].value); setKind("saida");
  };

  const submit = async () => {
    const v = Number(amount);
    if (!desc.trim()) return toast.error("Descrição do item é obrigatória");
    if (!v || v <= 0) return toast.error("Informe um valor válido");
    if (!walletId) return toast.error("Selecione o balde");
    if (techHubBlocked) {
      return toast.error("Zona de Alerta — gastos da Tavares Tech Hub estão suspensos.");
    }

    setBusy(true);
    try {
      await postTransaction({
        walletId,
        amount: v,
        kind,
        delta: kind === "entrada" ? v : -v,
        description: desc.trim(),
        source: kind === "entrada" ? "Manual" : undefined,
        category: kind === "saida" ? category : undefined,
      });
      toast.success(kind === "entrada" ? "Entrada registrada" : "Saída registrada");
      setOpen(false);
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Registrar movimentação"
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow-amber)] flex items-center justify-center active:scale-95 transition"
      >
        <Plus className="h-6 w-6" strokeWidth={2.6} />
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-w-[92vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setKind("entrada")}
                className={`rounded-lg border p-3 flex items-center justify-center gap-2 text-sm font-medium transition ${
                  kind === "entrada"
                    ? "border-[var(--income)] bg-[var(--income)]/15 text-[var(--income)]"
                    : "border-border text-muted-foreground"
                }`}
              >
                <ArrowUpCircle className="h-4 w-4" /> Entrada
              </button>
              <button
                onClick={() => setKind("saida")}
                className={`rounded-lg border p-3 flex items-center justify-center gap-2 text-sm font-medium transition ${
                  kind === "saida"
                    ? "border-destructive bg-destructive/15 text-destructive"
                    : "border-border text-muted-foreground"
                }`}
              >
                <ArrowDownCircle className="h-4 w-4" /> Saída
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mv-desc">
                Descrição do Item <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mv-desc" required value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Pão da bodega"
                aria-invalid={!desc.trim()}
              />
              {!desc.trim() && (
                <p className="text-[10px] text-muted-foreground">Obrigatório — descreva o item para salvar.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mv-amount">Valor (R$)</Label>
              <Input
                id="mv-amount" type="number" inputMode="decimal" placeholder="0,00"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-semibold tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Balde</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger><SelectValue placeholder="Selecione o balde" /></SelectTrigger>
                <SelectContent>
                  {data.wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} — {w.category === "sobrevivencia" ? "Liquidez" : "Reserva"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {kind === "saida" && (
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex flex-col">
                          <span className="font-bold tracking-wide">{c.label}</span>
                          <span className="text-[10px] text-muted-foreground">{c.hint}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {techHubBlocked && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-2.5 text-[11px] text-destructive">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span><b>Zona de Alerta:</b> gastos da Tavares Tech Hub estão suspensos enquanto o nível for Bronze.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={busy || !desc.trim() || techHubBlocked}>
              {busy ? "Salvando…" : "Salvar Movimentação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
