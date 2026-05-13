
-- Drop existing permissive public policies
DROP POLICY IF EXISTS "public read wallets" ON public.wallets;
DROP POLICY IF EXISTS "public write wallets" ON public.wallets;
DROP POLICY IF EXISTS "public read transactions" ON public.transactions;
DROP POLICY IF EXISTS "public write transactions" ON public.transactions;
DROP POLICY IF EXISTS "public read fixed" ON public.fixed_accounts;
DROP POLICY IF EXISTS "public write fixed" ON public.fixed_accounts;

-- Wallets: authenticated-only access (shared between co-commanders)
CREATE POLICY "authenticated read wallets" ON public.wallets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert wallets" ON public.wallets
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update wallets" ON public.wallets
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete wallets" ON public.wallets
  FOR DELETE TO authenticated USING (true);

-- Transactions
CREATE POLICY "authenticated read transactions" ON public.transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete transactions" ON public.transactions
  FOR DELETE TO authenticated USING (true);

-- Fixed accounts
CREATE POLICY "authenticated read fixed" ON public.fixed_accounts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert fixed" ON public.fixed_accounts
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update fixed" ON public.fixed_accounts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete fixed" ON public.fixed_accounts
  FOR DELETE TO authenticated USING (true);

-- Realtime: restrict broadcast/subscription to authenticated users only
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "authenticated can receive realtime" ON realtime.messages
  FOR SELECT TO authenticated USING (true);
