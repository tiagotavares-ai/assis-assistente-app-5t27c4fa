// Categorias oficiais de despesas do Assis.
export const EXPENSE_CATEGORIES = [
  { value: "BODEGA",          label: "BODEGA",          hint: "Alimentação diária e mercadinho" },
  { value: "RAIANE",          label: "RAIANE",          hint: "Repasses conjugais e Bolsa Família" },
  { value: "THAYLA",          label: "THAYLA",          hint: "Necessidades exclusivas — TEA" },
  { value: "CONTAS FIXAS",    label: "CONTAS FIXAS",    hint: "Água, Energia, Internet, Infra Digital" },
  { value: "TAVARES TECH HUB",label: "TAVARES TECH HUB",hint: "Reinvestimentos e ferramentas digitais" },
  { value: "TRANSPORTE",      label: "TRANSPORTE",      hint: "Combustível e mototáxi" },
  { value: "FARMÁCIA",        label: "FARMÁCIA",        hint: "Medicamentos e saúde" },
  { value: "ESCOLA",          label: "ESCOLA",          hint: "Taxas e materiais estudantis" },
  { value: "PESSOAL",         label: "PESSOAL",         hint: "Lazer e lanches do Diretor" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

export const TECH_HUB_CATEGORY: ExpenseCategory = "TAVARES TECH HUB";
