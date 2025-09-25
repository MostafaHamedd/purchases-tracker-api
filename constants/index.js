// Constants for the backend API

const PURCHASE_CONSTANTS = {
  GRAMS_PRECISION: 1,
  KARAT_CONVERSION_RATE: 0.857, // 18k to 21k conversion
  DEFAULT_DISCOUNT_RATE: 0,
  BASE_FEE_PER_GRAM: 5, // EGP per gram
};

const STATUS_VALUES = {
  PENDING: "Pending",
  PAID: "Paid",
  PARTIAL: "Partial",
  OVERDUE: "Overdue",
};

const KARAT_TYPES = {
  EIGHTEEN: "18",
  TWENTY_ONE: "21",
};

module.exports = {
  PURCHASE_CONSTANTS,
  STATUS_VALUES,
  KARAT_TYPES,
};
