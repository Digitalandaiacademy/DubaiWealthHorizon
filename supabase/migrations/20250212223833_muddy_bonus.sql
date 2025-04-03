/*
  # Add last investment amount column
  
  1. Changes
    - Add last_investment_amount column to profiles table
    - This column will store the most recent investment amount for a user
*/

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS last_investment_amount numeric DEFAULT 0;