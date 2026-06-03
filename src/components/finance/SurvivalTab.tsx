import { useMemo } from "react";
import {
  Activity, Banknote, Smartphone, AlertTriangle, Siren, AlertOctagon,
  Trophy, Award, Medal, Eye, EyeOff, ShieldCheck, CalendarClock,
  Bike, Lock, Info,
} from "lucide-react";
import {
  fmtDate, getCurrentCycle, classifyLevel, floor2,
  TIER_THRESHOLDS, ALERT_RED_THRESHOLD, type SurvivalLevel,
} from "@/lib/cycle";
import { useMaskValues } from "@/hooks/useMaskValues";
import { RecentActivity } from "@/components/finance/RecentActivity";
import { RACReport } from "@/components/finance/RACReport";
import type { useFinanceData } from "@/hooks/useFinanceData";

const TIERS: Record<SurvivalLevel, { color: string; label: string; icon: typeof Medal; tone: string }> = {
  bronze: { color: "#CD7F32", label: "Atenção · Crítico", icon: Medal,  tone: "Vermelho" },
  prata:  { color: "#E0B84A", label: "Atenção",           icon: Award,  tone: "Amarelo" },
  ouro:   { color: "#22C55E", label: "Ouro · Seguro",     icon: Trophy, tone: "Verde" },
};

export function SurvivalTab({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const { fmt, masked, toggle } = useMaskValues();
  const picpay  = data.get("PicPay");
  const especie = data.get("Espécie");
  const nove9pay = data.get("99Pay");
  const nubank  = data.get("Nubank");
  const fundoAluguel = data.get("Fundo Aluguel");

  const cycle = getCurrentCycle();
  // FÓRMULA: somente o PicPay alimenta a métrica diária de sobrevivência.
  const picpayBalance = picpay?.balance ?? 0;
  const perDay = floor2(picpayBalance / cycle.daysRemaining);
  const level = classifyLevel(perDay);
  const tier = TIERS[level];

  // Alerta Vermelho: dispara dinamicamente sempre que a métrica do PicPay
  // cair abaixo de R$ 15,00/dia.
  const showRedAlert = perDay < ALERT_RED_THRESHOLD;

  const heroBg = `linear-gradient(135deg, ${tier.color}, color-mix(in oklab, ${tier.color} 55%, #000))`;
  const heroGlow = `0 0 32px -6px ${tier.color}aa`;
  const heroText = level === "bronze" ? "#fff" : "#0b0b0b";
  const heroTextSoft = level === "bronze" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)";

  const progressPct = Math.min(100, (cycle.elapsed / cycle.totalDays) * 100);
  const todayBudget = useMemo(() => Math.max(0, perDay), [perDay]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Alerta Vermelho — controle de danos na bodega */}
      {showRedAlert && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive bg-destructive/15 p-3 text-xs text-destructive">
          <Siren className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider">Zona de Alerta</div>
            <div className="opacity-90 mt-0.5">
              Gastos do <span className="font-bold">MEU LAR</span> sob restrição preventiva.
            </div>
          </div>
        </div>
      )}

      {/* Métrica Principal */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 border"
        style={{ background: heroBg, boxShadow: heroGlow, borderColor: `${tier.color}66` }}
      >
        <div className="flex items-center justify-between text-[10px] tracking-[0.25em] uppercase" style={{ color: heroTextSoft }}>
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Métrica · {tier.label}
          </span>
          <button
            onClick={toggle}
            aria-label={masked ? "Mostrar valores" : "Ocultar valores"}
            className="rounded-md p-1 hover:bg-black/10 transition"
            style={{ color: heroText }}
          >
            {masked ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="mt-3" style={{ color: heroText }}>
          <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: heroTextSoft }}>
            Orçamento diário disponível
          </div>
          <div className="text-4xl font-bold tracking-tight tabular-nums">{fmt(todayBudget)}</div>
          <div className="text-xs mt-1" style={{ color: heroTextSoft }}>
            {cycle.daysRemaining} {cycle.daysRemaining === 1 ? "dia restante" : "dias restantes"} até {fmtDate(cycle.end)}
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="h-full transition-all" style={{ width: `${progressPct}%`, background: heroText }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: heroTextSoft }}>
          <span>Ciclo: {fmtDate(cycle.start)} a {fmtDate(cycle.end)}</span>
          <span>PicPay: {fmt(picpayBalance)}</span>
        </div>
      </section>

      {/* Painel do Ciclo */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-industrial)]">
        <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3" /> Painel do Ciclo
          </span>
          <span>Ciclo: {fmtDate(cycle.start)} a {fmtDate(cycle.end)}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fim do ciclo</div>
            <div className="text-lg font-bold tabular-nums mt-0.5">
              {cycle.end.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {cycle.end.toLocaleDateString("pt-BR", { weekday: "long" })}
            </div>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Dias restantes</div>
            <div className="text-lg font-bold tabular-nums mt-0.5">
              {cycle.daysRemaining} {cycle.daysRemaining === 1 ? "dia" : "dias"}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">inclui hoje e o dia 26</div>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <div className="font-mono text-foreground">
            {fmt(picpayBalance)} ÷ {cycle.daysRemaining} = <span className="font-bold">{fmt(perDay)}/dia</span>
          </div>
          <div className="mt-1">
            Apenas o <span className="font-bold text-foreground">1º Balde — PicPay</span> alimenta o orçamento diário.
            Espécie, 99Pay, Nubank e Fundo Carimbado ficam <span className="font-bold text-foreground">fora</span> do cálculo.
          </div>
        </div>
      </section>

      {/* Régua de níveis */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-[var(--shadow-industrial)]">
        <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <span>Níveis de Sobrevivência</span>
          <span style={{ color: tier.color }} className="font-bold">{tier.tone}</span>
        </div>
        <TierRow level="bronze" perDay={perDay} active={level === "bronze"} fmt={fmt} />
        <TierRow level="prata"  perDay={perDay} active={level === "prata"}  fmt={fmt} />
        <TierRow level="ouro"   perDay={perDay} active={level === "ouro"}   fmt={fmt} />
      </section>

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
              <span className="font-bold">{fmt(totalOverdue)}</span>
            </div>
            <div className="divide-y divide-amber-500/15">
              {overdue.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-1.5">
                  <div className="text-sm">
                    {f.name}
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-500/80">venceu dia {f.due_day}</span>
                  </div>
                  <div className="text-sm font-bold tabular-nums">{fmt(Number(f.amount))}</div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Baldes Operacionais */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Baldes Operacionais
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            PicPay <span className="font-bold text-foreground tabular-nums">{fmt(picpayBalance)}</span>
          </span>
        </div>

        <BucketCard
          icon={Smartphone}
          name="1º Balde — PicPay"
          subtitle="Sobrevivência Familiar · base do orçamento diário"
          balance={picpayBalance}
          fmt={fmt}
          highlight
        />

        <BucketCard
          icon={Banknote}
          name="3º Balde — Carteira Dupla"
          subtitle="Físico · cédulas e moedas"
          balance={especie?.balance ?? 0}
          fmt={fmt}
          warning={(especie?.balance ?? 0) <= 15 ? "Nível baixo para logística de rua" : undefined}
        />

        <BucketCard
          icon={Bike}
          name="4º Balde — 99Pay"
          subtitle="Mobilidade Urbana"
          balance={nove9pay?.balance ?? 0}
          fmt={fmt}
          badge="Pendência interna no app: R$ 6,00"
        />

        {/* Nubank — Reserva Estrutural blindada */}
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">2º Balde — Nubank</div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-500/90">
                  Estrutural · fora do orçamento diário
                </div>
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-emerald-500">{fmt(nubank?.balance ?? 0)}</div>
          </div>
        </div>

        {/* Fundo Carimbado — Aluguel */}
        <div className="rounded-xl border border-violet-500/40 bg-violet-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-violet-500/15 text-violet-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  Fundo Carimbado · Aluguel
                  <Info className="h-3 w-3 text-violet-400/80" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-violet-400/90">
                  Retido em espécie · execução presencial 05/06
                </div>
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-violet-400">{fmt(fundoAluguel?.balance ?? 0)}</div>
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-wider text-violet-400/70">
            Excluído de qualquer cálculo de sobrevivência
          </div>
        </div>
      </section>

      {/* Relatório de Atualização Contínua (RAC) */}
      <RACReport data={data} />

      <RecentActivity data={data} />
    </div>
  );
}

function TierRow({
  level, perDay, active, fmt,
}: { level: SurvivalLevel; perDay: number; active: boolean; fmt: (v: number) => string }) {
  const t = TIERS[level];
  const Icon = t.icon;
  const threshold = TIER_THRESHOLDS[level];
  const rule =
    level === "bronze" ? `< ${fmt(TIER_THRESHOLDS.bronze)}/dia`
    : level === "prata" ? `≥ ${fmt(TIER_THRESHOLDS.prata)}/dia (atenção até < ${fmt(TIER_THRESHOLDS.ouro)})`
    : `≥ ${fmt(TIER_THRESHOLDS.ouro)}/dia`;
  void threshold;
  return (
    <div
      className="rounded-xl border p-3 transition-all flex items-center gap-3"
      style={{
        borderColor: active ? t.color : "var(--border)",
        background: active ? `linear-gradient(135deg, color-mix(in oklab, ${t.color} 14%, transparent), transparent)` : "transparent",
        boxShadow: active ? `0 0 24px -6px ${t.color}80` : undefined,
      }}
    >
      <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${t.color}22`, color: t.color }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: t.color }}>{t.label}</div>
        <div className="text-[10px] text-muted-foreground">Regra: {rule}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-semibold text-foreground">
          {active ? "Você está aqui" : ""}
        </div>
      </div>
    </div>
  );
}

function BucketCard({
  icon: Icon, name, subtitle, balance, warning, badge, highlight, fmt,
}: {
  icon: typeof Activity; name: string; subtitle?: string; balance: number;
  warning?: string; badge?: string; highlight?: boolean;
  fmt: (v: number) => string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-4 shadow-[var(--shadow-industrial)] ${
      warning ? "border-amber-500/50" : highlight ? "border-primary/50" : "border-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            warning ? "bg-amber-500/15 text-amber-500" : "bg-primary/15 text-primary"
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5">
              {name}
              {warning && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            {subtitle && (
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div className={`text-lg font-bold tabular-nums ${warning ? "text-amber-500" : ""}`}>{fmt(balance)}</div>
      </div>
      {warning && <div className="mt-2 text-[10px] uppercase tracking-wider text-amber-500/90">{warning}</div>}
      {badge && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-500">
          <AlertTriangle className="h-3 w-3" /> {badge}
        </div>
      )}
    </div>
  );
}
