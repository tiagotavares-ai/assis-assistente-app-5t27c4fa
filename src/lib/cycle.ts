// Ciclo de Sobrevivência: do dia 28 de um mês ao dia 26 do mês seguinte (BPC).
// Métrica diária: saldo do balde PicPay / dias restantes até o próximo dia 26.
const MS_DAY = 86400000;
const CYCLE_END_DAY = 26;
const CYCLE_START_DAY = 28;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_DAY);

export type SurvivalLevel = "ouro" | "prata" | "bronze";

export const TIER_THRESHOLDS = {
  ouro: 25,
  prata: 20,
  bronze: 15,
} as const;

// Limite a partir do qual o Alerta Vermelho dispara automaticamente.
export const ALERT_RED_THRESHOLD = 15;

export const CYCLE_END_LABEL = `dia ${CYCLE_END_DAY}`;

export function getCurrentCycle(today: Date = new Date()) {
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();

  const end = day < CYCLE_END_DAY
    ? new Date(year, month, CYCLE_END_DAY)
    : new Date(year, month + 1, CYCLE_END_DAY);

  const start = new Date(end.getFullYear(), end.getMonth() - 1, CYCLE_START_DAY);

  const totalDays = diffDays(end, start);
  const elapsed = Math.max(0, diffDays(today, start));
  const daysRemaining = Math.max(1, diffDays(end, today) + 1);

  return { start, end, totalDays, elapsed, daysRemaining };
}

export function classifyLevel(perDay: number): SurvivalLevel {
  if (perDay >= TIER_THRESHOLDS.ouro) return "ouro";
  if (perDay < TIER_THRESHOLDS.bronze) return "bronze";
  return "prata";
}

// Trunca para baixo no segundo decimal para refletir o orçamento real disponível.
export function floor2(n: number) {
  return Math.floor(n * 100) / 100;
}

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
