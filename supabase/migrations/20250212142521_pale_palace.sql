/*
  # Schéma initial pour DubaiWealth Horizon

  1. Tables
    - `profiles` : Informations des utilisateurs
      - `id` (uuid, clé primaire)
      - `email` (text)
      - `full_name` (text)
      - `phone_number` (text)
      - `referral_code` (text)
      - `referred_by` (uuid, référence à profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `investment_plans` : Plans d'investissement disponibles
      - `id` (uuid, clé primaire)
      - `name` (text)
      - `price` (numeric)
      - `daily_roi` (numeric)
      - `min_withdrawal` (numeric)
      - `features` (text[])
      - `created_at` (timestamp)

    - `user_investments` : Investissements des utilisateurs
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à profiles)
      - `plan_id` (uuid, référence à investment_plans)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `transactions` : Historique des transactions
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à profiles)
      - `investment_id` (uuid, référence à user_investments)
      - `type` (text)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour limiter l'accès aux données
*/

-- Création de la table profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone_number text,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table investment_plans
CREATE TABLE investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  daily_roi numeric NOT NULL,
  min_withdrawal numeric NOT NULL,
  features text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Création de la table user_investments
CREATE TABLE user_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  plan_id uuid REFERENCES investment_plans(id) NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  investment_id uuid REFERENCES user_investments(id),
  type text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politiques pour investment_plans
CREATE POLICY "Anyone can view investment plans"
  ON investment_plans FOR SELECT
  TO authenticated
  USING (true);

-- Politiques pour user_investments
CREATE POLICY "Users can view their own investments"
  ON user_investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments"
  ON user_investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politiques pour transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Insertion des plans d'investissement
INSERT INTO investment_plans (name, price, daily_roi, min_withdrawal, features) VALUES
  ('Plan Bronze', 5000, 0.8, 1000, ARRAY['Rendement quotidien de 0.8%', 'Retrait minimum: 1,000 FCFA', 'Support 24/7', 'Tableau de bord basique']),
  ('Plan Argent', 7500, 1.0, 1500, ARRAY['Rendement quotidien de 1%', 'Retrait minimum: 1,500 FCFA', 'Support prioritaire', 'Tableau de bord personnalisé']),
  ('Plan Or', 10000, 1.2, 2000, ARRAY['Rendement quotidien de 1.2%', 'Retrait minimum: 2,000 FCFA', 'Support VIP', 'Accès aux statistiques avancées']),
  ('Plan Platine', 12500, 1.5, 2500, ARRAY['Rendement quotidien de 1.5%', 'Retrait minimum: 2,500 FCFA', 'Support dédié', 'Analyses de marché']),
  ('Plan Saphir', 15000, 1.8, 3000, ARRAY['Rendement quotidien de 1.8%', 'Retrait minimum: 3,000 FCFA', 'Conseiller personnel', 'Rapports détaillés']),
  ('Plan Émeraude', 20000, 2.0, 4000, ARRAY['Rendement quotidien de 2%', 'Retrait minimum: 4,000 FCFA', 'Conseiller VIP', 'Accès événements exclusifs']),
  ('Plan Rubis', 25000, 2.2, 5000, ARRAY['Rendement quotidien de 2.2%', 'Retrait minimum: 5,000 FCFA', 'Service conciergerie', 'Bonus mensuels']),
  ('Plan Diamant', 50000, 2.5, 10000, ARRAY['Rendement quotidien de 2.5%', 'Retrait minimum: 10,000 FCFA', 'Service premium', 'Bonus trimestriels']),
  ('Plan Royal', 100000, 3.0, 20000, ARRAY['Rendement quotidien de 3%', 'Retrait minimum: 20,000 FCFA', 'Service ultra-premium', 'Bonus spéciaux']),
  ('Plan Impérial', 250000, 3.5, 50000, ARRAY['Rendement quotidien de 3.5%', 'Retrait minimum: 50,000 FCFA', 'Service élite', 'Avantages exclusifs']),
  ('Plan Légendaire', 500000, 4.0, 100000, ARRAY['Rendement quotidien de 4%', 'Retrait minimum: 100,000 FCFA', 'Service légendaire', 'Avantages illimités']),
  ('Plan Suprême', 750000, 4.5, 150000, ARRAY['Rendement quotidien de 4.5%', 'Retrait minimum: 150,000 FCFA', 'Service suprême', 'Privilèges exclusifs']);