# Old System Code Cleanup Summary

## Overview
This document summarizes the cleanup of old discount calculation system code that was replaced with the new `discount_tiers` table-based system.

## Files Removed

### Migration Files
- `run-complete-migration.js` - Old migration script
- `run-discount-migration.js` - Old discount migration script
- `database/migrations/add_supplier_discount_thresholds.sql` - Old migration for JSON columns
- `database/migrations/fix_discount_rates_complete.sql` - Old migration for JSON columns
- `database/migrations/update_discount_rates_to_percentages.sql` - Old percentage migration

### Stored Procedures
- `database/procedures/calculate_discount.sql` - Old stored procedure
- `database/procedures/` directory - Removed (now empty)

### Documentation
- `DISCOUNT_PERCENTAGE_MIGRATION.md` - Old migration documentation

### Test Files
- `test-discount-percentages.js` - Old test for percentage migration
- `test-discount-application.js` - Old test for discount application
- `test-discount-display.js` - Old test for discount display

## Code Updated

### Controllers
- `controllers/monthlyTotalsController.js` - Updated `calculateReceiptDiscount` method to use `DiscountCalculationService` instead of old stored procedure

## Current System

### Active Components
- `services/discountCalculationService.js` - New discount calculation service using `discount_tiers` table
- `services/recalculationService.js` - Service for recalculating discounts
- `controllers/discountTiersController.js` - API for managing discount tiers
- `database/migrations/update_suppliers_for_21k_only.sql` - Current migration for 21k-only system

### Database Tables
- `discount_tiers` - Current discount configuration table
- `suppliers` - No longer contains JSON discount columns

## Benefits of Cleanup
1. **Simplified Architecture** - Single source of truth for discount configuration
2. **Better Maintainability** - No conflicting systems
3. **Improved Performance** - No JSON parsing overhead
4. **Cleaner Codebase** - Removed obsolete files and code paths
5. **Consistent API** - All discount operations use the same service layer

## Migration Status
✅ **Complete** - All old system code has been removed and replaced with the new `discount_tiers` table-based system.
