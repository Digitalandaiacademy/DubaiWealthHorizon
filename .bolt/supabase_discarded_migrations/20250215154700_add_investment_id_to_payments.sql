-- Add investment_id column to payment_verifications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_verifications' 
        AND column_name = 'investment_id'
    ) THEN
        ALTER TABLE payment_verifications 
        ADD COLUMN investment_id uuid REFERENCES user_investments(id);
    END IF;
END $$;
