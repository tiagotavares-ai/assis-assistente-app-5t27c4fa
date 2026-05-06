import { Activity, Banknote, Smartphone, AlertTriangle, Target, HandCoins, Siren } from "lucide-react";
import { fmtBRL, fmtDate, getCurrentCycle } from "@/lib/cycle";
import { RecentActivity } from "@/components/finance/RecentActivity";
import type { useFinanceData } from "@/hooks/useFinanceData";

export function SurvivalTab({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const picpay = data.get("PicPay");
  const especie = data.get("Espécie");
  const total = (picpay?.balance ?? 0) + (especie?.balance ?? 0);
  const cycle = getCurrentCycle();
  const perDay = total / cycle.remaining;
  const progress = (cycle.elapsed / cycle.totalDays) * 100;
  const meta = 20;
  const critical = perDay < meta;
  const metaPct = Math.min(100, (perDay / meta) * 100);
  const asfixia = perDay < 10;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {asfixia && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive bg-destructive/15 p-3 text-xs text-destructive animate-pulse">
          <Siren className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-bold uppercase tracking-wider">Atenção: Zona de Asfixia · {fmtBRL(perDay)}/dia</span>
        </div>
      )}
      {/* Métrica principal */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 border border-primary/30"
        style={{ background: "var(--gradient-survival)", boxShadow: "var(--shadow-glow-amber)" }}
      >
        <div className="flex items-center justify-between text-primary-foreground/80 text-[10px] tracking-[0.25em] uppercase">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Métrica de Sobrevivência
          </span>
          <span>Ciclo {fmtDate(cycle.start)}–{fmtDate(cycle.end)}</span>
        </div>
        <div className="mt-3 text-primary-foreground">
          <div className="text-4xl font-bold tracking-tight">{fmtBRL(perDay)}</div>
          <div className="text-xs opacity-80 mt-1">por dia · {cycle.remaining} dias restantes</div>
        </div>
        {/* Progress */}
        <div className="mt-4 h-1.5 rounded-full bg-black/25 overflow-hidden">
          <div
            className="h-full bg-primary-foreground/90 transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-primary-foreground/70">
          <span>Dia {cycle.elapsed} de {cycle.totalDays}</span>
          <span>Total: {fmtBRL(total)}</span>
        </div>
      </section>

      {/* Meta de dignidade */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <span className="flex items-center gap-1.5"><Target className="h-3 w-3" /> Meta de Dignidade</span>
          <span>{fmtBRL(meta)}/dia</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-xl font-bold tabular-nums">{fmtBRL(perDay)}</div>
          <div className={`text-xs font-semibold ${critical ? "text-destructive" : "text-[var(--income)]"}`}>
            {critical ? `Faltam ${fmtBRL(meta - perDay)}/dia` : "Meta atingida"}
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${critical ? "bg-destructive" : "bg-[var(--income)]"}`}
            style={{ width: `${metaPct}%` }}
          />
        </div>
      </section>

      {critical && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Alerta: orçamento diário abaixo da meta de dignidade ({fmtBRL(meta)}/dia).</span>
        </div>
      )}

      {/* Recebíveis atrasados */}
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase text-amber-500/90">
          <HandCoins className="h-3 w-3" /> Recebíveis Atrasados
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm">Jaisson</div>
          <div className="text-sm font-bold tabular-nums">{fmtBRL(50)}</div>
        </div>
      </section>

      {/* Baldes */}
      <section className="space-y-3">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground px-1">
          Baldes Operacionais
        </h2>
        <BucketCard icon={Smartphone} name="PicPay" balance={picpay?.balance ?? 0} accent="primary" />
        <BucketCard icon={Banknote} name="Espécie" balance={especie?.balance ?? 0} accent="primary" />
      </section>

      <RecentActivity data={data} />
    </div>
  );
}

function BucketCard({
  icon: Icon, name, balance, accent,
}: { icon: typeof Activity; name: string; balance: number; accent: "primary" | "structural" }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-industrial)]">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          accent === "primary" ? "bg-primary/15 text-primary" : "bg-[var(--structural)]/15 text-[var(--structural)]"
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Saldo disponível
          </div>
        </div>
      </div>
      <div className="text-lg font-bold tabular-nums">{fmtBRL(balance)}</div>
    </div>
  );
}
