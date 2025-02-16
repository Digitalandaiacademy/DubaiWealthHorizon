-- Fonction pour vérifier un paiement et créer un investissement dans une seule transaction
create or replace function verify_payment_and_create_investment(
  p_payment_id uuid,
  p_transaction_id text,
  p_user_id uuid,
  p_plan_id uuid,
  p_amount numeric
) returns json language plpgsql security definer as $$
declare
  v_investment_id uuid;
  v_payment payment_verifications;
begin
  -- Vérifier que le paiement existe et est en attente
  select * into v_payment
  from payment_verifications
  where id = p_payment_id
  and status = 'pending'
  for update;

  if v_payment is null then
    raise exception 'Paiement non trouvé ou déjà traité';
  end if;

  -- Créer le nouvel investissement
  insert into user_investments (
    user_id,
    plan_id,
    amount,
    status,
    created_at,
    updated_at,
    transaction_id
  ) values (
    p_user_id,
    p_plan_id,
    p_amount,
    'active',
    now(),
    now(),
    p_transaction_id
  ) returning id into v_investment_id;

  -- Mettre à jour le paiement
  update payment_verifications
  set
    status = 'verified',
    transaction_id = p_transaction_id,
    verified_at = now(),
    investment_id = v_investment_id
  where id = p_payment_id;

  return json_build_object(
    'success', true,
    'investment_id', v_investment_id
  );

  exception when others then
    -- En cas d'erreur, la transaction sera automatiquement annulée
    return json_build_object(
      'success', false,
      'error', SQLERRM
    );
end;
$$;
