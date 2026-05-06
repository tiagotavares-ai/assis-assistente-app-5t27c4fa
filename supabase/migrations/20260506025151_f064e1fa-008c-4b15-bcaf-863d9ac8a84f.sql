
-- Wallets table
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('sobrevivencia','estrutural')),
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  kind text NOT NULL CHECK (kind IN ('entrada','saida','alocacao')),
  description text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fixed accounts (contas estruturais)
CREATE TABLE public.fixed_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  due_day int NOT NULL DEFAULT 1 CHECK (due_day BETWEEN 1 AND 31),
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_accounts ENABLE ROW LEVEL SECURITY;

-- Permissive policies (single-user personal finance app, no auth)
CREATE POLICY "public read wallets" ON public.wallets FOR SELECT USING (true);
CREATE POLICY "public write wallets" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "public write transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read fixed" ON public.fixed_accounts FOR SELECT USING (true);
CREATE POLICY "public write fixed" ON public.fixed_accounts FOR ALL USING (true) WITH CHECK (true);

-- Seed wallets
INSERT INTO public.wallets (name, category, balance) VALUES
  ('PicPay', 'sobrevivencia', 0),
  ('Espécie', 'sobrevivencia', 0),
  ('Nubank', 'estrutural', 0);

-- Realtime
ALTER TABLE public.wallets REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.fixed_accounts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fixed_accounts;
