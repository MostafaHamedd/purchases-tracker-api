const { pool } = require("./config/database");

const updatePurchasesData = async () => {
  try {
    console.log("🔄 Starting purchase data update...");

    // First, let's clear existing data to start fresh
    console.log("🗑️ Clearing existing data...");
    await pool.execute("DELETE FROM payments");
    await pool.execute("DELETE FROM purchase_receipts");
    await pool.execute("DELETE FROM purchase_suppliers");
    await pool.execute("DELETE FROM purchases");

    // Insert the new purchases data
    console.log("📝 Inserting new purchases...");

    const purchases = [
      {
        id: "1",
        date: "2025-09-05",
        store_id: "store-001",
        status: "Pending",
        total_grams_21k_equivalent: 300,
        total_base_fees: 1500,
        total_discount_amount: 6700,
        total_net_fees: -5200,
        due_date: "2025-10-05",
      },
      {
        id: "2",
        date: "2025-09-08",
        store_id: "store-002",
        status: "Partial",
        total_grams_21k_equivalent: 400,
        total_base_fees: 2000,
        total_discount_amount: 8900,
        total_net_fees: -6900,
        due_date: "2025-10-08",
      },
      {
        id: "3",
        date: "2025-09-12",
        store_id: "store-001",
        status: "Paid",
        total_grams_21k_equivalent: 500,
        total_base_fees: 2500,
        total_discount_amount: 11100,
        total_net_fees: -8600,
        due_date: "2025-10-12",
      },
      {
        id: "4",
        date: "2025-08-15",
        store_id: "store-002",
        status: "Overdue",
        total_grams_21k_equivalent: 300,
        total_base_fees: 1500,
        total_discount_amount: 0,
        total_net_fees: 1500,
        due_date: "2025-09-15",
      },
      {
        id: "5",
        date: "2025-08-20",
        store_id: "store-001",
        status: "Pending",
        total_grams_21k_equivalent: 200,
        total_base_fees: 1000,
        total_discount_amount: 0,
        total_net_fees: 1000,
        due_date: "2025-09-20",
      },
      {
        id: "6",
        date: "2025-08-24",
        store_id: "store-002",
        status: "Partial",
        total_grams_21k_equivalent: 250,
        total_base_fees: 1250,
        total_discount_amount: 0,
        total_net_fees: 1250,
        due_date: "2025-09-24",
      },
      // New September purchase to differentiate from mock data
      {
        id: "7",
        date: "2025-09-18",
        store_id: "store-001",
        status: "Pending",
        total_grams_21k_equivalent: 350,
        total_base_fees: 1750,
        total_discount_amount: 0,
        total_net_fees: 1750,
        due_date: "2025-10-18",
      },
    ];

    for (const purchase of purchases) {
      await pool.execute(
        `INSERT INTO purchases (id, store_id, date, status, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchase.id,
          purchase.store_id,
          purchase.date,
          purchase.status,
          purchase.total_grams_21k_equivalent,
          purchase.total_base_fees,
          purchase.total_discount_amount,
          purchase.total_net_fees,
          purchase.due_date,
        ]
      );
    }

    // Insert purchase suppliers data
    console.log("📝 Inserting purchase suppliers...");

    const purchaseSuppliers = [
      {
        id: "ps1",
        purchase_id: "1",
        supplier_id: "supplier-001", // EGS
        total_grams_18k: 100,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 185.7,
        total_base_fees: 500,
        total_discount_amount: 3350,
        total_net_fees: -2850,
        receipt_count: 1,
      },
      {
        id: "ps2",
        purchase_id: "1",
        supplier_id: "supplier-002", // PGS
        total_grams_18k: 50,
        total_grams_21k: 50,
        total_grams_21k_equivalent: 92.9,
        total_base_fees: 250,
        total_discount_amount: 1675,
        total_net_fees: -1425,
        receipt_count: 1,
      },
      {
        id: "ps3",
        purchase_id: "1",
        supplier_id: "supplier-003", // SGS
        total_grams_18k: 0,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 100,
        total_base_fees: 500,
        total_discount_amount: 1675,
        total_net_fees: -1175,
        receipt_count: 1,
      },
      {
        id: "ps4",
        purchase_id: "2",
        supplier_id: "supplier-001", // EGS
        total_grams_18k: 150,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 228.6,
        total_base_fees: 750,
        total_discount_amount: 4450,
        total_net_fees: -3700,
        receipt_count: 1,
      },
      {
        id: "ps5",
        purchase_id: "2",
        supplier_id: "supplier-002", // PGS
        total_grams_18k: 0,
        total_grams_21k: 150,
        total_grams_21k_equivalent: 150,
        total_base_fees: 750,
        total_discount_amount: 4450,
        total_net_fees: -3700,
        receipt_count: 1,
      },
      {
        id: "ps6",
        purchase_id: "3",
        supplier_id: "supplier-001", // EGS
        total_grams_18k: 200,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 271.4,
        total_base_fees: 1000,
        total_discount_amount: 5550,
        total_net_fees: -4550,
        receipt_count: 1,
      },
      {
        id: "ps7",
        purchase_id: "3",
        supplier_id: "supplier-002", // PGS
        total_grams_18k: 0,
        total_grams_21k: 200,
        total_grams_21k_equivalent: 200,
        total_base_fees: 1000,
        total_discount_amount: 5550,
        total_net_fees: -4550,
        receipt_count: 1,
      },
      {
        id: "ps8",
        purchase_id: "4",
        supplier_id: "supplier-001", // EGS
        total_grams_18k: 100,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 185.7,
        total_base_fees: 750,
        total_discount_amount: 0,
        total_net_fees: 750,
        receipt_count: 1,
      },
      {
        id: "ps9",
        purchase_id: "4",
        supplier_id: "supplier-003", // SGS
        total_grams_18k: 0,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 100,
        total_base_fees: 750,
        total_discount_amount: 0,
        total_net_fees: 750,
        receipt_count: 1,
      },
      {
        id: "ps10",
        purchase_id: "5",
        supplier_id: "supplier-001", // EGS
        total_grams_18k: 50,
        total_grams_21k: 50,
        total_grams_21k_equivalent: 92.9,
        total_base_fees: 500,
        total_discount_amount: 0,
        total_net_fees: 500,
        receipt_count: 1,
      },
      {
        id: "ps11",
        purchase_id: "5",
        supplier_id: "supplier-003", // SGS
        total_grams_18k: 0,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 100,
        total_base_fees: 500,
        total_discount_amount: 0,
        total_net_fees: 500,
        receipt_count: 1,
      },
      {
        id: "ps12",
        purchase_id: "6",
        supplier_id: "supplier-001", // EGS
        total_grams_18k: 100,
        total_grams_21k: 50,
        total_grams_21k_equivalent: 135.7,
        total_base_fees: 625,
        total_discount_amount: 0,
        total_net_fees: 625,
        receipt_count: 1,
      },
      {
        id: "ps13",
        purchase_id: "6",
        supplier_id: "supplier-003", // SGS
        total_grams_18k: 0,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 100,
        total_base_fees: 625,
        total_discount_amount: 0,
        total_net_fees: 625,
        receipt_count: 1,
      },
      // New September purchase supplier
      {
        id: "ps14",
        purchase_id: "7",
        supplier_id: "supplier-001", // EGS
        total_grams_18k: 150,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 228.6,
        total_base_fees: 875,
        total_discount_amount: 0,
        total_net_fees: 875,
        receipt_count: 1,
      },
      {
        id: "ps15",
        purchase_id: "7",
        supplier_id: "supplier-002", // PGS
        total_grams_18k: 0,
        total_grams_21k: 100,
        total_grams_21k_equivalent: 100,
        total_base_fees: 875,
        total_discount_amount: 0,
        total_net_fees: 875,
        receipt_count: 1,
      },
    ];

    for (const ps of purchaseSuppliers) {
      await pool.execute(
        `INSERT INTO purchase_suppliers (id, purchase_id, supplier_id, total_grams_18k, total_grams_21k, total_grams_21k_equivalent, total_base_fees, total_discount_amount, total_net_fees, receipt_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ps.id,
          ps.purchase_id,
          ps.supplier_id,
          ps.total_grams_18k,
          ps.total_grams_21k,
          ps.total_grams_21k_equivalent,
          ps.total_base_fees,
          ps.total_discount_amount,
          ps.total_net_fees,
          ps.receipt_count,
        ]
      );
    }

    // Insert purchase receipts data
    console.log("📝 Inserting purchase receipts...");

    const purchaseReceipts = [
      // Purchase 1 receipts
      {
        id: "pr1",
        purchase_id: "1",
        supplier_id: "supplier-001",
        receipt_number: 1,
        grams_18k: 100,
        grams_21k: 100,
        total_grams_21k: 185.7,
        base_fees: 500,
        discount_rate: 0.15,
        discount_amount: 3350,
        net_fees: -2850,
      },
      {
        id: "pr2",
        purchase_id: "1",
        supplier_id: "supplier-002",
        receipt_number: 1,
        grams_18k: 50,
        grams_21k: 50,
        total_grams_21k: 92.9,
        base_fees: 250,
        discount_rate: 0.15,
        discount_amount: 1675,
        net_fees: -1425,
      },
      {
        id: "pr3",
        purchase_id: "1",
        supplier_id: "supplier-003",
        receipt_number: 1,
        grams_18k: 0,
        grams_21k: 100,
        total_grams_21k: 100,
        base_fees: 500,
        discount_rate: 0.15,
        discount_amount: 1675,
        net_fees: -1175,
      },
      // Purchase 2 receipts
      {
        id: "pr4",
        purchase_id: "2",
        supplier_id: "supplier-001",
        receipt_number: 1,
        grams_18k: 150,
        grams_21k: 100,
        total_grams_21k: 228.6,
        base_fees: 750,
        discount_rate: 0.18,
        discount_amount: 4450,
        net_fees: -3700,
      },
      {
        id: "pr5",
        purchase_id: "2",
        supplier_id: "supplier-002",
        receipt_number: 1,
        grams_18k: 0,
        grams_21k: 150,
        total_grams_21k: 150,
        base_fees: 750,
        discount_rate: 0.18,
        discount_amount: 4450,
        net_fees: -3700,
      },
      // Purchase 3 receipts
      {
        id: "pr6",
        purchase_id: "3",
        supplier_id: "supplier-001",
        receipt_number: 1,
        grams_18k: 200,
        grams_21k: 100,
        total_grams_21k: 271.4,
        base_fees: 1000,
        discount_rate: 0.2,
        discount_amount: 5550,
        net_fees: -4550,
      },
      {
        id: "pr7",
        purchase_id: "3",
        supplier_id: "supplier-002",
        receipt_number: 1,
        grams_18k: 0,
        grams_21k: 200,
        total_grams_21k: 200,
        base_fees: 1000,
        discount_rate: 0.2,
        discount_amount: 5550,
        net_fees: -4550,
      },
      // Purchase 4 receipts
      {
        id: "pr8",
        purchase_id: "4",
        supplier_id: "supplier-001",
        receipt_number: 1,
        grams_18k: 100,
        grams_21k: 100,
        total_grams_21k: 185.7,
        base_fees: 750,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 750,
      },
      {
        id: "pr9",
        purchase_id: "4",
        supplier_id: "supplier-003",
        receipt_number: 1,
        grams_18k: 0,
        grams_21k: 100,
        total_grams_21k: 100,
        base_fees: 750,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 750,
      },
      // Purchase 5 receipts
      {
        id: "pr10",
        purchase_id: "5",
        supplier_id: "supplier-001",
        receipt_number: 1,
        grams_18k: 50,
        grams_21k: 50,
        total_grams_21k: 92.9,
        base_fees: 500,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 500,
      },
      {
        id: "pr11",
        purchase_id: "5",
        supplier_id: "supplier-003",
        receipt_number: 1,
        grams_18k: 0,
        grams_21k: 100,
        total_grams_21k: 100,
        base_fees: 500,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 500,
      },
      // Purchase 6 receipts
      {
        id: "pr12",
        purchase_id: "6",
        supplier_id: "supplier-001",
        receipt_number: 1,
        grams_18k: 100,
        grams_21k: 50,
        total_grams_21k: 135.7,
        base_fees: 625,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 625,
      },
      {
        id: "pr13",
        purchase_id: "6",
        supplier_id: "supplier-003",
        receipt_number: 1,
        grams_18k: 0,
        grams_21k: 100,
        total_grams_21k: 100,
        base_fees: 625,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 625,
      },
      // New September purchase receipts
      {
        id: "pr14",
        purchase_id: "7",
        supplier_id: "supplier-001",
        receipt_number: 1,
        grams_18k: 150,
        grams_21k: 100,
        total_grams_21k: 228.6,
        base_fees: 875,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 875,
      },
      {
        id: "pr15",
        purchase_id: "7",
        supplier_id: "supplier-002",
        receipt_number: 1,
        grams_18k: 0,
        grams_21k: 100,
        total_grams_21k: 100,
        base_fees: 875,
        discount_rate: 0,
        discount_amount: 0,
        net_fees: 875,
      },
    ];

    for (const pr of purchaseReceipts) {
      await pool.execute(
        `INSERT INTO purchase_receipts (id, purchase_id, supplier_id, receipt_number, grams_18k, grams_21k, total_grams_21k, base_fees, discount_rate, discount_amount, net_fees)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pr.id,
          pr.purchase_id,
          pr.supplier_id,
          pr.receipt_number,
          pr.grams_18k,
          pr.grams_21k,
          pr.total_grams_21k,
          pr.base_fees,
          pr.discount_rate,
          pr.discount_amount,
          pr.net_fees,
        ]
      );
    }

    // Insert payments data
    console.log("📝 Inserting payments...");

    const payments = [
      {
        id: "pay1",
        purchase_id: "1",
        date: "2025-09-10",
        grams_paid: 50,
        fees_paid: 1000,
        karat_type: "21",
        note: "Initial payment",
      },
      {
        id: "pay2",
        purchase_id: "2",
        date: "2025-09-12",
        grams_paid: 100,
        fees_paid: 2000,
        karat_type: "21",
        note: "Partial payment",
      },
      {
        id: "pay3",
        purchase_id: "3",
        date: "2025-09-15",
        grams_paid: 500,
        fees_paid: 8600,
        karat_type: "21",
        note: "Full payment",
      },
      {
        id: "pay4",
        purchase_id: "6",
        date: "2025-09-01",
        grams_paid: 100,
        fees_paid: 500,
        karat_type: "21",
        note: "Partial payment",
      },
    ];

    for (const payment of payments) {
      await pool.execute(
        `INSERT INTO payments (id, purchase_id, date, grams_paid, fees_paid, karat_type, note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          payment.id,
          payment.purchase_id,
          payment.date,
          payment.grams_paid,
          payment.fees_paid,
          payment.karat_type,
          payment.note,
        ]
      );
    }

    console.log("✅ Purchase data update completed successfully!");
    console.log(
      `📊 Updated ${purchases.length} purchases, ${purchaseSuppliers.length} purchase suppliers, ${purchaseReceipts.length} receipts, ${payments.length} payments`
    );

    // Show the new September purchase to verify
    console.log(
      "\n🔍 New September purchase (ID: 7) added to differentiate from mock data:"
    );
    const [newPurchase] = await pool.execute(
      "SELECT * FROM purchases WHERE id = '7'"
    );
    console.log(JSON.stringify(newPurchase[0], null, 2));
  } catch (error) {
    console.error("❌ Error updating purchase data:", error);
    throw error;
  }
};

if (require.main === module) {
  updatePurchasesData()
    .then(() => {
      console.log("🎉 Purchase data update completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Purchase data update failed:", error);
      process.exit(1);
    });
}

module.exports = { updatePurchasesData };


