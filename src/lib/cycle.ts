// Ciclo de Sobrevivência: do dia 20 de um mês ao dia 26 do mês seguinte.
export function getCurrentCycle(today: Date = new Date()) {
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  let startYear = year, startMonth = month;
  // se ainda não chegamos ao dia 20, o ciclo começou no mês anterior
  if (day < 20) {
    startMonth = month - 1;
    if (startMonth < 0) { startMonth = 11; startYear -= 1; }
  }
  const start = new Date(startYear, startMonth, 20);
  const end = new Date(startYear, startMonth + 1, 23);

  const msDay = 86400000;
  const totalDays = Math.round((end.getTime() - start.getTime()) / msDay);
  const elapsed = Math.max(0, Math.round((today.getTime() - start.getTime()) / msDay));
  const remaining = Math.max(1, totalDays - elapsed); // nunca dividir por 0

  return { start, end, totalDays, elapsed, remaining };
}

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
