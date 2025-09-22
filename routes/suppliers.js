const express = require("express");
const router = express.Router();
const suppliersController = require("../controllers/suppliersController");

// GET /api/suppliers - Get all suppliers
router.get("/", suppliersController.getAllSuppliers);

// GET /api/suppliers/:id - Get single supplier by ID
router.get("/:id", suppliersController.getSupplierById);

// POST /api/suppliers - Create new supplier
router.post("/", suppliersController.createSupplier);

// PUT /api/suppliers/:id - Update supplier
router.put("/:id", suppliersController.updateSupplier);

// DELETE /api/suppliers/:id - Delete supplier
router.delete("/:id", suppliersController.deleteSupplier);

module.exports = router;


