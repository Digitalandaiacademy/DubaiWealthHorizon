-- Create system_settings table
CREATE TABLE system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO system_settings (key, value) VALUES
    ('investment_cycle_days', '90'),
    ('bronze_daily_roi', '0.8'),
    ('silver_daily_roi', '1.0'),
    ('gold_daily_roi', '1.2'),
    ('platinum_daily_roi', '1.5');

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read system settings"
    ON system_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify system settings"
    ON system_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add role column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
    END IF;
END $$;
