-- ============================================================
-- Map Cash — Migração: Split categoria food
-- Aplicar em: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Atualiza o check constraint para incluir food_home e food_out
alter table transactions
  drop constraint if exists transactions_category_check;

alter table transactions
  add constraint transactions_category_check
  check (category in (
    'food_home', 'food_out',
    'transport', 'housing', 'health', 'education',
    'entertainment', 'shopping', 'travel',
    'salary', 'freelance', 'investment', 'other'
  ));

-- Migra registros antigos com 'food' para 'food_home'
update transactions set category = 'food_home' where category = 'food';

-- Atualiza o check constraint de budgets também
alter table budgets
  drop constraint if exists budgets_category_check;
