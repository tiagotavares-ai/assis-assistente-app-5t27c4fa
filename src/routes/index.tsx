import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/finance/Dashboard";

export const Route = createFileRoute("/")({
  component: Dashboard,
});
