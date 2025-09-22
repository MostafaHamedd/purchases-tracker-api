const express = require("express");
const router = express.Router();
const discountTiersController = require("../controllers/discountTiersController");

// GET /api/discount-tiers - Get all discount tiers
router.get("/", discountTiersController.getAllDiscountTiers);

// GET /api/discount-tiers/:id - Get single discount tier by ID
router.get("/:id", discountTiersController.getDiscountTierById);

// GET /api/discount-tiers/supplier/:supplierId - Get discount tiers for a specific supplier
router.get(
  "/supplier/:supplierId",
  discountTiersController.getDiscountTiersBySupplier
);

// POST /api/discount-tiers - Create new discount tier
router.post("/", discountTiersController.createDiscountTier);

// PUT /api/discount-tiers/:id - Update discount tier
router.put("/:id", discountTiersController.updateDiscountTier);

// DELETE /api/discount-tiers/:id - Delete discount tier
router.delete("/:id", discountTiersController.deleteDiscountTier);

module.exports = router;


