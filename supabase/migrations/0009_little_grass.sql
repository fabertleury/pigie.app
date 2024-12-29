/*
  # Add total deposit slots to goals table

  1. Changes
    - Add total_deposit_slots column to goals table
    - Set default value to 250 for backward compatibility
    - Add check constraint to ensure valid values
*/

ALTER TABLE goals
ADD COLUMN total_deposit_slots integer NOT NULL DEFAULT 250
CHECK (total_deposit_slots >= 100 AND total_deposit_slots <= 400);