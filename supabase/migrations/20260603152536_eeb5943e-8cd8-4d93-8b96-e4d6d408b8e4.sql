
ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_category_check;
ALTER TABLE public.wallets ADD CONSTRAINT wallets_category_check
  CHECK (category IN ('sobrevivencia', 'estrutural', 'carimbado'));
