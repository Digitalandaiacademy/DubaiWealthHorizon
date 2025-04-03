-- Ajout du champ transaction_id à la table payment_verifications
ALTER TABLE payment_verifications
ADD COLUMN transaction_id TEXT,
ADD COLUMN verified_transaction_id TEXT,
ADD COLUMN investment_plan TEXT,
ADD COLUMN investment_duration INTEGER;
