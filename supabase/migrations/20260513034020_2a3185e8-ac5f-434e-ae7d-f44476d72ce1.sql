
-- 1. Add user_id columns (nullable first for backfill)
ALTER TABLE public.wallets        ADD COLUMN user_id uuid;
ALTER TABLE public.transactions   ADD COLUMN user_id uuid;
ALTER TABLE public.fixed_accounts ADD COLUMN user_id uuid;

-- 2. Backfill existing rows to the admin (Tiago)
UPDATE public.wallets        SET user_id = '422ff777-a500-4993-8bd0-542ae28709bf' WHERE user_id IS NULL;
UPDATE public.transactions   SET user_id = '422ff777-a500-4993-8bd0-542ae28709bf' WHERE user_id IS NULL;
UPDATE public.fixed_accounts SET user_id = '422ff777-a500-4993-8bd0-542ae28709bf' WHERE user_id IS NULL;

-- 3. Enforce ownership: NOT NULL + default to current auth uid
ALTER TABLE public.wallets        ALTER COLUMN user_id SET NOT NULL,
                                  ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.transactions   ALTER COLUMN user_id SET NOT NULL,
                                  ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.fixed_accounts ALTER COLUMN user_id SET NOT NULL,
                                  ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_wallets_user_id        ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id   ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_accounts_user_id ON public.fixed_accounts(user_id);

-- 4. Drop old permissive policies
DROP POLICY IF EXISTS "authenticated read wallets"       ON public.wallets;
DROP POLICY IF EXISTS "authenticated insert wallets"     ON public.wallets;
DROP POLICY IF EXISTS "authenticated update wallets"     ON public.wallets;
DROP POLICY IF EXISTS "authenticated delete wallets"     ON public.wallets;
DROP POLICY IF EXISTS "authenticated read transactions"   ON public.transactions;
DROP POLICY IF EXISTS "authenticated insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "authenticated update transactions" ON public.transactions;
DROP POLICY IF EXISTS "authenticated delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "authenticated read fixed"   ON public.fixed_accounts;
DROP POLICY IF EXISTS "authenticated insert fixed" ON public.fixed_accounts;
DROP POLICY IF EXISTS "authenticated update fixed" ON public.fixed_accounts;
DROP POLICY IF EXISTS "authenticated delete fixed" ON public.fixed_accounts;

-- 5. Owner-scoped policies
CREATE POLICY "owner read wallets"   ON public.wallets   FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owner insert wallets" ON public.wallets   FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner update wallets" ON public.wallets   FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner delete wallets" ON public.wallets   FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "owner read transactions"   ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owner insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner update transactions" ON public.transactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner delete transactions" ON public.transactions FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "owner read fixed"   ON public.fixed_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owner insert fixed" ON public.fixed_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner update fixed" ON public.fixed_accounts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner delete fixed" ON public.fixed_accounts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 6. Realtime: tighten to authenticated subscribers (channel-level scoping is per-app)
DROP POLICY IF EXISTS "authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "authenticated can receive realtime" ON realtime.messages
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
