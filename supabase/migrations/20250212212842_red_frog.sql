/*
  # Amélioration de la gestion des paiements

  1. Modifications
    - Ajout du champ `payment_status` à la table `profiles`
    - Ajout du champ `payment_pending_since` à la table `profiles`
    - Ajout du champ `last_payment_attempt` à la table `profiles`
  
  2. Sécurité
    - Mise à jour des politiques pour permettre aux admins de gérer les paiements
*/

-- Ajout des nouveaux champs à la table profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS payment_pending_since timestamptz,
  ADD COLUMN IF NOT EXISTS last_payment_attempt timestamptz;

-- Mise à jour des politiques
CREATE POLICY "Admins can update payment status"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );