// Ciclo de Sobrevivência: do dia 20 de um mês ao dia 19 do mês seguinte (30 dias).
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
  // exibição: último dia do ciclo (dia 19 do mês seguinte)
  const end = new Date(startYear, startMonth + 1, 19);

  const msDay = 86400000;
  const totalDays = Math.round((nextCycleStart.getTime() - start.getTime()) / msDay);
  const elapsed = Math.max(0, Math.round((today.getTime() - start.getTime()) / msDay));
  const remaining = Math.max(1, totalDays - elapsed);

  // Marcos: próxima ocorrência do dia 23 (Prata) e 26 (Ouro) a partir de hoje.
  const nextOccurrence = (targetDay: number) => {
    let y = year, m = month;
    if (day >= targetDay) { m += 1; if (m > 11) { m = 0; y += 1; } }
    return new Date(y, m, targetDay);
  };
  const daysUntil = (target: Date) => {
    const diff = Math.ceil((target.getTime() - today.getTime()) / msDay);
    return Math.max(1, diff);
  };
  const silverTarget = nextOccurrence(23);
  const goldTarget = nextOccurrence(26);

  return {
    start,
    end,
    totalDays,
    elapsed,
    remaining, // Bronze: dias até próximo dia 20
    bronzeDays: remaining,
    silverDays: daysUntil(silverTarget),
    goldDays: daysUntil(goldTarget),
  };
}

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
