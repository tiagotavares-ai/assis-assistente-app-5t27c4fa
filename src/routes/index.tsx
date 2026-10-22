import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/finance/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assis Gestor — Governança Familiar" },
      { name: "description", content: "Gestão financeira e proteção familiar com acompanhamento de saldos, compromissos e orçamento diário." },
      { property: "og:title", content: "Assis Gestor — Governança Familiar" },
      { property: "og:description", content: "Acompanhe saldos, compromissos e orçamento diário para a proteção familiar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});
