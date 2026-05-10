import { Activity, Banknote, Smartphone, AlertTriangle, Target, Siren, AlertOctagon, Trophy, Award, Medal } from "lucide-react";
import { fmtBRL, fmtDate, getCurrentCycle } from "@/lib/cycle";
import { RecentActivity } from "@/components/finance/RecentActivity";
import type { useFinanceData } from "@/hooks/useFinanceData";

const TIERS = {
  bronze: { color: "#CD7F32", label: "Bronze", icon: Medal },
  silver: { color: "#C0C0C0", label: "Prata", icon: Award },
  gold:   { color: "#FFD700", label: "Ouro",   icon: Trophy },
} as const;

type TierKey = keyof typeof TIERS;

export function SurvivalTab({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const picpay = data.get("PicPay");
  const especie = data.get("Espécie");
  const total = (picpay?.balance ?? 0) + (especie?.balance ?? 0);
  const cycle = getCurrentCycle();

  const bronzePerDay = total / cycle.bronzeDays;
  const silverPerDay = total / cycle.silverDays;
  const goldPerDay = total / cycle.goldDays;

  const meta = 20;
  const critical = bronzePerDay < meta;
  const asfixia = bronzePerDay < 10;
  const progress = (cycle.elapsed / cycle.totalDays) * 100;

  const activeTier: TierKey =
    goldPerDay >= meta ? "gold" : silverPerDay >= meta ? "silver" : "bronze";

  // Cor dinâmica do card principal: maior nível atingido, ou vermelho se Bronze < meta.
  const CRITICAL = "#EF4444";
  const heroColor = bronzePerDay < meta ? CRITICAL : TIERS[activeTier].color;
  const heroBg = `linear-gradient(135deg, ${heroColor}, color-mix(in oklab, ${heroColor} 55%, #000))`;
  const heroGlow = `0 0 32px -6px ${heroColor}aa`;
  const heroLevelLabel = bronzePerDay < meta ? "Crítico" : TIERS[activeTier].label;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {asfixia && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive bg-destructive/15 p-3 text-xs text-destructive animate-pulse">
          <Siren className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-bold uppercase tracking-wider">Atenção: Zona de Asfixia · {fmtBRL(bronzePerDay)}/dia</span>
        </div>
      )}
      {/* Métrica principal (Bronze) */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 border border-primary/30"
        style={{ background: "var(--gradient-survival)", boxShadow: "var(--shadow-glow-amber)" }}
      >
        <div className="flex items-center justify-between text-primary-foreground/80 text-[10px] tracking-[0.25em] uppercase">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Métrica de Sobrevivência
          </span>
          <span>Ciclo: {fmtDate(cycle.start)} a {fmtDate(cycle.end)}</span>
        </div>
        <div className="mt-3 text-primary-foreground">
          <div className="text-4xl font-bold tracking-tight">{fmtBRL(bronzePerDay)}</div>
          <div className="text-xs opacity-80 mt-1">por dia · {cycle.bronzeDays} dias restantes</div>
        </div>
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

      {/* Metas por Nível */}
      <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-4 space-y-3 shadow-[var(--shadow-industrial)]">
        <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <span className="flex items-center gap-1.5"><Target className="h-3 w-3" /> Metas por Nível</span>
          <span>Alvo {fmtBRL(meta)}/dia</span>
        </div>

        <TierCard tierKey="bronze" perDay={bronzePerDay} days={cycle.bronzeDays} meta={meta} active={activeTier === "bronze"} />
        <TierCard tierKey="silver" perDay={silverPerDay} days={cycle.silverDays} meta={meta} active={activeTier === "silver"} />
        <TierCard tierKey="gold"   perDay={goldPerDay}   days={cycle.goldDays}   meta={meta} active={activeTier === "gold"} />

        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground uppercase tracking-wider">Status hoje</span>
          <span className="font-bold" style={{ color: TIERS[activeTier].color }}>
            {bronzePerDay >= meta ? "Estável" : "Abaixo da meta"} · {TIERS[activeTier].label}
          </span>
        </div>

        {/* Barra de progresso tripla */}
        <div className="h-2 rounded-full overflow-hidden flex bg-muted">
          <div className="h-full transition-all" style={{ width: `${Math.min(100, (bronzePerDay/meta)*100)/3}%`, background: TIERS.bronze.color }} />
          <div className="h-full transition-all" style={{ width: `${Math.min(100, (silverPerDay/meta)*100)/3}%`, background: TIERS.silver.color }} />
          <div className="h-full transition-all" style={{ width: `${Math.min(100, (goldPerDay/meta)*100)/3}%`, background: TIERS.gold.color }} />
        </div>
      </section>

      {critical && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Alerta: nível Bronze ({fmtBRL(bronzePerDay)}/dia) abaixo do alvo de {fmtBRL(meta)}/dia.</span>
        </div>
      )}

      {/* Contas atrasadas */}
      {(() => {
        const today = new Date();
        const cutoffDay = today.getDate();
        const overdue = data.fixed.filter((f) => !f.paid && f.due_day < cutoffDay);
        if (overdue.length === 0) return null;
        const totalOverdue = overdue.reduce((s, f) => s + Number(f.amount), 0);
        return (
          <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-amber-500">
              <span className="flex items-center gap-1.5">
                <AlertOctagon className="h-3 w-3" /> Contas Atrasadas
              </span>
              <span className="font-bold">{fmtBRL(totalOverdue)}</span>
            </div>
            <div className="divide-y divide-amber-500/15">
              {overdue.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-1.5">
                  <div className="text-sm">
                    {f.name}
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-500/80">
                      venceu dia {f.due_day}
                    </span>
                  </div>
                  <div className="text-sm font-bold tabular-nums">{fmtBRL(Number(f.amount))}</div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Baldes */}
      <section className="space-y-3">
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground px-1">
          Baldes Operacionais
        </h2>
        <BucketCard icon={Smartphone} name="PicPay" balance={picpay?.balance ?? 0} accent="primary" />
        <BucketCard
          icon={Banknote}
          name="Espécie"
          balance={especie?.balance ?? 0}
          accent="primary"
          warning={(especie?.balance ?? 0) <= 15 ? "Nível baixo para logística de rua" : undefined}
        />
      </section>

      <RecentActivity data={data} />
    </div>
  );
}

function BucketCard({
  icon: Icon, name, balance, accent, warning,
}: { icon: typeof Activity; name: string; balance: number; accent: "primary" | "structural"; warning?: string }) {
  return (
    <div className={`rounded-xl border bg-card p-4 shadow-[var(--shadow-industrial)] ${
      warning ? "border-amber-500/50" : "border-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            warning
              ? "bg-amber-500/15 text-amber-500"
              : accent === "primary"
                ? "bg-primary/15 text-primary"
                : "bg-[var(--structural)]/15 text-[var(--structural)]"
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5">
              {name}
              {warning && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Saldo disponível
            </div>
          </div>
        </div>
        <div className={`text-lg font-bold tabular-nums ${warning ? "text-amber-500" : ""}`}>
          {fmtBRL(balance)}
        </div>
      </div>
      {warning && (
        <div className="mt-2 text-[10px] uppercase tracking-wider text-amber-500/90">
          {warning}
        </div>
      )}
    </div>
  );
}

function TierCard({
  tierKey, perDay, days, meta, active,
}: { tierKey: TierKey; perDay: number; days: number; meta: number; active: boolean }) {
  const tier = TIERS[tierKey];
  const Icon = tier.icon;
  const pct = Math.min(100, (perDay / meta) * 100);
  const ok = perDay >= meta;
  return (
    <div
      className={`rounded-xl border p-3 transition-all ${active ? "shadow-[0_0_24px_-6px]" : ""}`}
      style={{
        borderColor: active ? tier.color : "var(--border)",
        background: active
          ? `linear-gradient(135deg, color-mix(in oklab, ${tier.color} 14%, transparent), transparent)`
          : "transparent",
        boxShadow: active ? `0 0 24px -6px ${tier.color}80` : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: `${tier.color}22`, color: tier.color }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase" style={{ color: tier.color }}>
              {tier.label}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {days} {days === 1 ? "dia" : "dias"} restantes
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold tabular-nums">{fmtBRL(perDay)}</div>
          <div className={`text-[10px] font-semibold ${ok ? "text-[var(--income)]" : "text-destructive"}`}>
            {ok ? "Atinge meta" : `−${fmtBRL(meta - perDay)}/dia`}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: tier.color }} />
      </div>
    </div>
  );
}
