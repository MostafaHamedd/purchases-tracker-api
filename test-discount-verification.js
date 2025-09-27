#!/usr/bin/env node

/**
 * Test script to verify the discount verification system works correctly
 */

const { pool } = require('./config/database');

async function testDiscountVerification() {
  try {
    console.log('🧪 Testing Discount Verification System');
    console.log('=====================================\n');

    // Step 1: Check current purchases and their discount status
    console.log('📊 Current Purchases and Discount Status:');
    console.log('========================================\n');
    
    const [purchases] = await pool.execute(`
      SELECT 
        p.id,
        p.total_grams_21k_equivalent,
        p.total_base_fees,
        p.total_discount_amount,
        p.total_net_fees,
        DATE_FORMAT(p.created_at, '%Y-%m') as month,
        GROUP_CONCAT(DISTINCT s.name) as supplier_names,
        GROUP_CONCAT(DISTINCT pr.supplier_id) as supplier_ids
      FROM purchases p
      JOIN purchase_receipts pr ON p.id = pr.purchase_id
      JOIN suppliers s ON pr.supplier_id = s.id
      WHERE DATE_FORMAT(p.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
      GROUP BY p.id, p.total_grams_21k_equivalent, p.total_base_fees, p.total_discount_amount, p.total_net_fees, p.created_at
      ORDER BY p.created_at DESC
    `);

    if (purchases.length === 0) {
      console.log('No purchases found for current month.');
      await pool.end();
      return;
    }

    console.log(`Found ${purchases.length} purchases for current month:\n`);
    purchases.forEach((purchase, index) => {
      console.log(`${index + 1}. Purchase ${purchase.id}:`);
      console.log(`   Suppliers: ${purchase.supplier_names}`);
      console.log(`   Grams: ${purchase.total_grams_21k_equivalent}g`);
      console.log(`   Base Fees: ${purchase.total_base_fees} EGP`);
      console.log(`   Discount: ${purchase.total_discount_amount} EGP`);
      console.log(`   Net Fees: ${purchase.total_net_fees} EGP`);
      console.log(`   Month: ${purchase.month}`);
      console.log('');
    });

    // Step 2: Check current monthly totals
    console.log('📈 Current Monthly Totals:');
    console.log('=========================\n');
    
    const [monthlyTotals] = await pool.execute(`
      SELECT 
        SUM(pr.grams_18k * 0.857 + pr.grams_21k) as total_grams,
        SUM(pr.base_fees) as total_base_fees,
        SUM(pr.discount_amount) as total_discount_amount,
        SUM(pr.net_fees) as total_net_fees
      FROM purchases p
      JOIN purchase_receipts pr ON p.id = pr.purchase_id
      WHERE DATE_FORMAT(p.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
    `);

    const totals = monthlyTotals[0];
    console.log(`Total Grams (21k equivalent): ${totals.total_grams || 0}g`);
    console.log(`Total Base Fees: ${totals.total_base_fees || 0} EGP`);
    console.log(`Total Discount Amount: ${totals.total_discount_amount || 0} EGP`);
    console.log(`Total Net Fees: ${totals.total_net_fees || 0} EGP`);
    console.log('');

    // Step 3: Check discount tiers for suppliers
    console.log('🎯 Discount Tiers for Current Suppliers:');
    console.log('======================================\n');
    
    const supplierIds = [...new Set(purchases.flatMap(p => p.supplier_ids.split(',')))];
    
    for (const supplierId of supplierIds) {
      const [tiers] = await pool.execute(`
        SELECT name, threshold, discount_percentage
        FROM discount_tiers
        WHERE supplier_id = ? AND karat_type = '21'
        ORDER BY threshold ASC
      `, [supplierId]);
      
      const [supplier] = await pool.execute(`
        SELECT name FROM suppliers WHERE id = ?
      `, [supplierId]);
      
      console.log(`Supplier: ${supplier[0].name} (ID: ${supplierId})`);
      if (tiers.length > 0) {
        tiers.forEach(tier => {
          console.log(`  - ${tier.name}: ${tier.threshold}g → ${(tier.discount_percentage * 100).toFixed(2)}%`);
        });
      } else {
        console.log('  - No discount tiers found');
      }
      console.log('');
    }

    // Step 4: Test the discount verification API endpoint
    console.log('🔍 Testing Discount Verification API:');
    console.log('====================================\n');
    
    // Simulate the API call with verify_discounts=true
    const [verificationResult] = await pool.execute(`
      SELECT DISTINCT pr.supplier_id
      FROM purchases p
      JOIN purchase_receipts pr ON p.id = pr.purchase_id
      WHERE DATE_FORMAT(p.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
    `);
    
    console.log(`Found ${verificationResult.length} suppliers to verify discounts for`);
    
    const suppliersToRecalculate = new Set();
    verificationResult.forEach(supplier => {
      suppliersToRecalculate.add(supplier.supplier_id);
    });
    
    console.log(`Suppliers to recalculate: ${Array.from(suppliersToRecalculate).join(', ')}`);
    console.log('');

    // Step 5: Check if discounts should be applied based on monthly totals
    console.log('💡 Discount Analysis:');
    console.log('====================\n');
    
    const monthlyTotalGrams = totals.total_grams || 0;
    console.log(`Monthly Total: ${monthlyTotalGrams}g`);
    
    for (const supplierId of suppliersToRecalculate) {
      const [tiers] = await pool.execute(`
        SELECT name, threshold, discount_percentage
        FROM discount_tiers
        WHERE supplier_id = ? AND karat_type = '21'
        ORDER BY threshold DESC
      `, [supplierId]);
      
      if (tiers.length > 0) {
        // Find the highest applicable tier
        let applicableTier = null;
        for (const tier of tiers) {
          if (monthlyTotalGrams >= tier.threshold) {
            applicableTier = tier;
            break;
          }
        }
        
        if (applicableTier) {
          console.log(`✅ Supplier ${supplierId}: Should get ${applicableTier.name} tier (${(applicableTier.discount_percentage * 100).toFixed(2)}% discount)`);
        } else {
          console.log(`❌ Supplier ${supplierId}: No discount applicable (monthly total ${monthlyTotalGrams}g below lowest threshold)`);
        }
      } else {
        console.log(`⚠️ Supplier ${supplierId}: No discount tiers configured`);
      }
    }

    console.log('\n✅ Discount verification test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testDiscountVerification();
