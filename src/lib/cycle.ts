// Ciclo de Sobrevivência: do dia 20 de um mês ao dia 19 do mês seguinte (30 dias).
// Os dias restantes são contados a partir de AMANHÃ (gastos de hoje considerados encerrados).
const MS_DAY = 86400000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_DAY);

export function getCurrentCycle(today: Date = new Date()) {
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();

  let startYear = year, startMonth = month;
  if (day < 20) {
    startMonth = month - 1;
    if (startMonth < 0) { startMonth = 11; startYear -= 1; }
  }
  const start = new Date(startYear, startMonth, 20);
  const nextCycleStart = new Date(startYear, startMonth + 1, 20);
  const end = new Date(startYear, startMonth + 1, 19);

  const totalDays = diffDays(nextCycleStart, start);
  const elapsed = Math.max(0, diffDays(today, start));

  // Próxima ocorrência de um dia-alvo (estritamente após hoje).
  const nextOccurrence = (targetDay: number) => {
    let y = year, m = month;
    if (day >= targetDay) { m += 1; if (m > 11) { m = 0; y += 1; } }
    return new Date(y, m, targetDay);
  };

  // Dias restantes: do amanhã até a data-alvo, inclusive.
  // Ex.: hoje 10/05 → alvo 20/05 = 10 dias.
  const daysRemaining = (target: Date) => Math.max(1, diffDays(target, today));

  const bronzeDays = daysRemaining(nextCycleStart); // próximo dia 20
  const silverDays = daysRemaining(nextOccurrence(23));
  const goldDays   = daysRemaining(nextOccurrence(26));

  return {
    start,
    end,
    totalDays,
    elapsed,
    remaining: bronzeDays,
    bronzeDays,
    silverDays,
    goldDays,
  };
}

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
