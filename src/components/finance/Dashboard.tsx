import { useState } from "react";
import { Activity, Wallet as WalletIcon, ArrowDownToLine, LogOut } from "lucide-react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { SurvivalTab } from "@/components/finance/SurvivalTab";
import { StructuralTab } from "@/components/finance/StructuralTab";
import { IncomeTab } from "@/components/finance/IncomeTab";
import { MovementFab } from "@/components/finance/MovementFab";
import { Toaster } from "@/components/ui/sonner";
import { AuthGate } from "@/components/auth/AuthGate";
import { supabase } from "@/integrations/supabase/client";

type Tab = "sobrevivencia" | "estrutural" | "entrada";

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "sobrevivencia", label: "Sobrevivência", icon: Activity },
  { id: "estrutural", label: "Estrutural", icon: WalletIcon },
  { id: "entrada", label: "Entrada", icon: ArrowDownToLine },
];

export function Dashboard() {
  return (
    <AuthGate>
      {() => <DashboardInner />}
    </AuthGate>
  );
}

function DashboardInner() {
  const [tab, setTab] = useState<Tab>("sobrevivencia");
  const data = useFinanceData();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_12px_#22c55e]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Sistema Operacional
            </span>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sair"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Assis <span className="text-primary">Assistente</span>
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-5 pb-28">
        {data.loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Carregando dados…
          </div>
        ) : (
          <>
            {tab === "sobrevivencia" && <SurvivalTab data={data} />}
            {tab === "estrutural" && <StructuralTab data={data} />}
            {tab === "entrada" && <IncomeTab data={data} />}
          </>
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t border-border bg-card/95 backdrop-blur-md">
        <div className="grid grid-cols-3">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-1 py-3 transition-all relative ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-10 bg-primary shadow-[0_0_8px_var(--primary)]" />
                )}
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-medium tracking-wide uppercase">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {!data.loading && <MovementFab data={data} />}

      <Toaster richColors position="top-center" />
    </div>
  );
}
