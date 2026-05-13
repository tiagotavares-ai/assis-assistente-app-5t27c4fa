// Ciclo de Faturamento: do dia 10 de um mês ao dia 23 do mês seguinte.
// Métrica diária: saldo total / dias restantes até o próximo dia 23.
const MS_DAY = 86400000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_DAY);

export type SurvivalLevel = "ouro" | "prata" | "bronze";

export const TIER_THRESHOLDS = {
  ouro: 25,
  prata: 20,
  bronze: 15,
} as const;

export function getCurrentCycle(today: Date = new Date()) {
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Início: dia 10 do mês atual se hoje >= 10, senão dia 10 do mês anterior.
  let startYear = year, startMonth = month;
  if (day < 10) {
    startMonth = month - 1;
    if (startMonth < 0) { startMonth = 11; startYear -= 1; }
  }
  const start = new Date(startYear, startMonth, 10);
  // Fim: próximo dia 23 (dia 23 do mês seguinte ao início).
  const end = new Date(startYear, startMonth + 1, 23);

  const totalDays = diffDays(end, start);
  const elapsed = Math.max(0, diffDays(today, start));

  // Dias restantes até o próximo dia 23 (inclui hoje e o dia 23).
  const daysRemaining = Math.max(1, diffDays(end, today) + 1);

  return { start, end, totalDays, elapsed, daysRemaining };
}

export function classifyLevel(perDay: number): SurvivalLevel {
  if (perDay >= TIER_THRESHOLDS.ouro) return "ouro";
  if (perDay < TIER_THRESHOLDS.bronze) return "bronze";
  return "prata";
}

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
