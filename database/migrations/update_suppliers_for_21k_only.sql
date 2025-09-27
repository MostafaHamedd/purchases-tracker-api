-- Migration to update suppliers for 21k only discount tiers
-- This removes 18k karat type support and adds supplier_karat_type field

-- Add supplier_karat_type column to suppliers table
ALTER TABLE suppliers 
ADD COLUMN supplier_karat_type ENUM('18', '21') NOT NULL DEFAULT '21';

-- Update existing suppliers to have supplier_karat_type based on their code
-- ES18 and EG18 suppliers should be 18k, others should be 21k
UPDATE suppliers 
SET supplier_karat_type = '18' 
WHERE code IN ('ES18', 'EG18');

UPDATE suppliers 
SET supplier_karat_type = '21' 
WHERE code NOT IN ('ES18', 'EG18');

-- Remove all 18k discount tiers (keep only 21k)
DELETE FROM discount_tiers WHERE karat_type = '18';

-- Update all remaining discount tiers to be 21k (in case there are any inconsistencies)
UPDATE discount_tiers SET karat_type = '21' WHERE karat_type != '21';

-- Add a check constraint to ensure only 21k discount tiers are allowed
ALTER TABLE discount_tiers 
ADD CONSTRAINT chk_karat_type_21k_only 
CHECK (karat_type = '21');
