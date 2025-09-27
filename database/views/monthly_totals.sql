-- Monthly Totals View
-- Calculates total 21k equivalent grams for each month across all suppliers
CREATE OR REPLACE VIEW monthly_totals AS
SELECT 
    DATE_FORMAT(p.date, '%Y-%m') as month_year,
    SUM(
        CASE 
            WHEN pr.karat_type = '18' THEN pr.grams_18k * 0.857  -- Convert 18k to 21k equivalent
            WHEN pr.karat_type = '21' THEN pr.grams_21k
            ELSE 0
        END
    ) as total_grams_21k_equivalent,
    COUNT(DISTINCT p.id) as total_purchases,
    COUNT(pr.id) as total_receipts
FROM purchases p
JOIN purchase_receipts pr ON p.id = pr.purchase_id
WHERE p.date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)  -- Last 12 months
GROUP BY DATE_FORMAT(p.date, '%Y-%m')
ORDER BY month_year DESC;
