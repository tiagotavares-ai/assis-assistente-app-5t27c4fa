import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Wallet } from "@/lib/finance";

export type FixedAccount = {
  id: string; name: string; amount: number; due_day: number; paid: boolean;
};

export type Transaction = {
  id: string;
  wallet_id: string;
  amount: number;
  kind: "entrada" | "saida" | "alocacao";
  description: string | null;
  source: string | null;
  category: string | null;
  created_at: string;
};

export function useFinanceData() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [fixed, setFixed] = useState<FixedAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    const [w, f, t] = await Promise.all([
      supabase.from("wallets").select("*").order("name"),
      supabase.from("fixed_accounts").select("*").order("due_day"),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    if (w.data) setWallets(w.data as Wallet[]);
    if (f.data) setFixed(f.data as FixedAccount[]);
    if (t.data) setTransactions(t.data as Transaction[]);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
    const ch = supabase
      .channel("finance")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallets" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "fixed_accounts" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, refetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const get = (name: string) => wallets.find((w) => w.name === name);
  return { wallets, fixed, transactions, loading, refetch, get };
}
