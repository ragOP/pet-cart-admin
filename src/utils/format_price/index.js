/**
 * Formats a number as a price with proper comma separators and decimal handling
 * 
 * @param {number|string} value - The price value to format
 * @param {object} options - Formatting options
 * @param {string} options.currency - Currency symbol (default: '₹')
 * @param {boolean} options.showCurrency - Whether to show currency symbol (default: true)
 * @param {string} options.locale - Locale for formatting (default: 'en-IN' for Indian formatting)
 * @param {number} options.minimumFractionDigits - Minimum decimal places (default: 0)
 * @param {number} options.maximumFractionDigits - Maximum decimal places (default: 2)
 * 
 * @returns {string} Formatted price string
 * 
 * @example
 * formatPrice(1000) // "₹1,000"
 * formatPrice(1000.28) // "₹1,000.28"
 * formatPrice(10000) // "₹10,000"
 * formatPrice(1000000) // "₹10,00,000" (Indian formatting)
 * formatPrice(1000.50) // "₹1,000.5"
 * formatPrice(null) // "₹0"
 */
export const formatPrice = (
  value,
  options = {}
) => {
  const {
    currency = '₹',
    showCurrency = true,
    locale = 'en-IN',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  // Handle edge cases
  if (value === null || value === undefined || value === '') {
    return showCurrency ? `${currency}0` : '0';
  }

  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Handle NaN
  if (isNaN(numValue)) {
    return showCurrency ? `${currency}0` : '0';
  }

  // Handle negative numbers
  const isNegative = numValue < 0;
  const absoluteValue = Math.abs(numValue);

  // Check if number has decimals
  const hasDecimals = absoluteValue % 1 !== 0;

  // Format the number with appropriate decimal places
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: hasDecimals ? minimumFractionDigits : 0,
    maximumFractionDigits: hasDecimals ? maximumFractionDigits : 0,
  }).format(absoluteValue);

  // Construct the final price string
  const prefix = isNegative ? '-' : '';
  const currencySymbol = showCurrency ? currency : '';
  
  return `${prefix}${currencySymbol}${formattedNumber}`;
};

/**
 * Formats price without currency symbol
 * 
 * @param {number|string} value - The price value to format
 * @returns {string} Formatted number string
 * 
 * @example
 * formatNumber(1000) // "1,000"
 * formatNumber(1000.28) // "1,000.28"
 */
export const formatNumber = (value) => {
  return formatPrice(value, { showCurrency: false });
};

/**
 * Formats price with international (en-US) formatting
 * 
 * @param {number|string} value - The price value to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted price string
 * 
 * @example
 * formatPriceInternational(1000) // "$1,000"
 * formatPriceInternational(1000000) // "$1,000,000"
 */
export const formatPriceInternational = (value, currency = '$') => {
  return formatPrice(value, { locale: 'en-US', currency });
};

/**
 * Formats price with custom decimal places
 * 
 * @param {number|string} value - The price value to format
 * @param {number} decimalPlaces - Number of decimal places to show
 * @returns {string} Formatted price string
 * 
 * @example
 * formatPriceWithDecimals(1000.5, 2) // "₹1,000.50"
 * formatPriceWithDecimals(1000, 2) // "₹1,000.00"
 */
export const formatPriceWithDecimals = (value, decimalPlaces = 2) => {
  return formatPrice(value, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

/**
 * Parse a formatted price string back to a number
 * 
 * @param {string} formattedPrice - The formatted price string
 * @returns {number} The numeric value
 * 
 * @example
 * parsePrice("₹1,000.50") // 1000.50
 * parsePrice("$1,234.56") // 1234.56
 */
export const parsePrice = (formattedPrice) => {
  if (!formattedPrice) return 0;
  
  // Remove currency symbols and commas
  const cleaned = String(formattedPrice).replace(/[₹$,]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

