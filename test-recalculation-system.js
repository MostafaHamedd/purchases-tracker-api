const { pool } = require("./config/database");
const RecalculationService = require("./services/recalculationService");

async function testRecalculationSystem() {
  try {
    console.log("🧪 Testing Recalculation System");
    console.log("================================");

    // Get current month
    const currentMonth = RecalculationService.getCurrentMonth();
    console.log(`📅 Current month: ${currentMonth}`);

    // Test 1: Get current state before recalculation
    console.log("\n📊 Current State Before Recalculation:");
    console.log("=====================================");

    const [beforeReceipts] = await pool.execute(
      `
      SELECT 
        pr.id,
        pr.supplier_id,
        pr.discount_rate,
        pr.discount_amount,
        pr.base_fees,
        pr.net_fees,
        s.name as supplier_name,
        DATE_FORMAT(pr.created_at, '%Y-%m') as month
      FROM purchase_receipts pr
      JOIN suppliers s ON pr.supplier_id = s.id
      WHERE DATE_FORMAT(pr.created_at, '%Y-%m') = ?
      ORDER BY pr.created_at DESC
      LIMIT 10
    `,
      [currentMonth]
    );

    console.log(`Found ${beforeReceipts.length} receipts in ${currentMonth}:`);
    beforeReceipts.forEach((receipt, index) => {
      console.log(
        `  ${index + 1}. ${receipt.supplier_name} - Discount: ${(
          receipt.discount_rate * 100
        ).toFixed(2)}% (${receipt.discount_amount} EGP)`
      );
    });

    // Test 2: Test supplier-specific recalculation
    if (beforeReceipts.length > 0) {
      const testSupplierId = beforeReceipts[0].supplier_id;
      console.log(`\n🔄 Testing recalculation for supplier ${testSupplierId}:`);

      const result = await RecalculationService.recalculateSupplierDiscounts(
        testSupplierId,
        currentMonth
      );

      if (result.success) {
        console.log(`✅ Recalculation successful: ${result.message}`);
      } else {
        console.log(`❌ Recalculation failed: ${result.error}`);
      }
    }

    // Test 3: Test month-wide recalculation
    console.log(`\n🔄 Testing month-wide recalculation for ${currentMonth}:`);

    const monthResult = await RecalculationService.recalculateMonthDiscounts(
      currentMonth
    );

    if (monthResult.success) {
      console.log(`✅ Month recalculation successful: ${monthResult.message}`);
      console.log(
        `📊 Updated ${monthResult.totalUpdated} receipts across ${monthResult.suppliers.length} suppliers`
      );
    } else {
      console.log(`❌ Month recalculation failed: ${monthResult.error}`);
    }

    // Test 4: Check state after recalculation
    console.log("\n📊 State After Recalculation:");
    console.log("=============================");

    const [afterReceipts] = await pool.execute(
      `
      SELECT 
        pr.id,
        pr.supplier_id,
        pr.discount_rate,
        pr.discount_amount,
        pr.base_fees,
        pr.net_fees,
        s.name as supplier_name,
        DATE_FORMAT(pr.created_at, '%Y-%m') as month
      FROM purchase_receipts pr
      JOIN suppliers s ON pr.supplier_id = s.id
      WHERE DATE_FORMAT(pr.created_at, '%Y-%m') = ?
      ORDER BY pr.created_at DESC
      LIMIT 10
    `,
      [currentMonth]
    );

    console.log(`Found ${afterReceipts.length} receipts in ${currentMonth}:`);
    afterReceipts.forEach((receipt, index) => {
      console.log(
        `  ${index + 1}. ${receipt.supplier_name} - Discount: ${(
          receipt.discount_rate * 100
        ).toFixed(2)}% (${receipt.discount_amount} EGP)`
      );
    });

    // Test 5: Compare before and after
    console.log("\n📈 Comparison:");
    console.log("===============");

    if (beforeReceipts.length > 0 && afterReceipts.length > 0) {
      const beforeTotal = beforeReceipts.reduce(
        (sum, r) => sum + parseFloat(r.discount_amount || 0),
        0
      );
      const afterTotal = afterReceipts.reduce(
        (sum, r) => sum + parseFloat(r.discount_amount || 0),
        0
      );

      console.log(
        `Total discount amount before: ${beforeTotal.toFixed(2)} EGP`
      );
      console.log(`Total discount amount after: ${afterTotal.toFixed(2)} EGP`);
      console.log(`Difference: ${(afterTotal - beforeTotal).toFixed(2)} EGP`);
    }

    console.log("\n✅ Recalculation system test completed!");
  } catch (error) {
    console.error("❌ Error testing recalculation system:", error);
  } finally {
    await pool.end();
  }
}

// Run the test
testRecalculationSystem();
