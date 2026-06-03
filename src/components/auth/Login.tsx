import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ALLOWED_EMAILS = [
  "tiagotavares.marques89@gmail.com",
  "raianelourenco882@gmail.com",
];

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!ALLOWED_EMAILS.includes(normalized)) {
      toast.error("Acesso negado: este e-mail não está autorizado.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 max-w-md mx-auto">
      <div className="w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_24px_var(--primary)]">
            <Activity className="h-8 w-8 text-primary" strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_12px_#22c55e]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Sistema Operacional
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Assis <span className="text-primary">Gestor</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Mecanismo de Governança e Proteção Familiar
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
