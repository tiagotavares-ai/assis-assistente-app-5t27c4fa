import { supabase } from "@/integrations/supabase/client";

export type Wallet = {
  id: string;
  name: string;
  category: "sobrevivencia" | "estrutural";
  balance: number;
};

export type TxKind = "entrada" | "saida" | "alocacao";

/** Cria transação e atualiza o saldo da wallet (delta = +amount para entrada/alocação positiva, -amount para saída). */
export async function postTransaction(params: {
  walletId: string;
  amount: number; // valor positivo
  kind: TxKind;
  delta: number; // pode ser positivo ou negativo
  description?: string;
  source?: string;
}) {
  const { walletId, amount, kind, delta, description, source } = params;

  const { data: wallet, error: wErr } = await supabase
    .from("wallets").select("balance").eq("id", walletId).single();
  if (wErr) throw wErr;

  const newBalance = Number(wallet.balance) + delta;

  const { error: tErr } = await supabase.from("transactions").insert({
    wallet_id: walletId, amount, kind, description: description ?? null, source: source ?? null,
  });
  if (tErr) throw tErr;

  const { error: uErr } = await supabase
    .from("wallets").update({ balance: newBalance }).eq("id", walletId);
  if (uErr) throw uErr;
}
