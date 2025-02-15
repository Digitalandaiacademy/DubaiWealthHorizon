/*
  # Add payment verification system
  
  1. Changes to profiles table
    - Add is_admin column to profiles table
    
  2. New Tables
    - payment_verifications table for tracking payment verification
    
  3. Security
    - Enable RLS
    - Add policies for admin and user access
*/

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create payment verifications table
CREATE TABLE payment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- Enable RLS
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage payment verifications"
  ON payment_verifications
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  ));

CREATE POLICY "Users can view their own payment verifications"
  ON payment_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Set initial admin user (replace UUID with your user ID)
-- UPDATE profiles SET is_admin = true WHERE id = 'your-user-id-here';