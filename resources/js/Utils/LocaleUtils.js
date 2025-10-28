/**
 * Frontend locale utilities.
 * Uses configuration provided by backend via Inertia.
 */

// No default config; must be initialized from backend
let localeConfig = null;

/**
 * Initialize locale configuration from backend.
 * @param {Object} config
 */
export function initLocale(config) {
  if (config && typeof config === 'object') {
    localeConfig = {
      ...config,
      // Ensure nested objects exist
      numberFormat: config.numberFormat || {
        decimal: ',',
        thousands: ' ',
      },
      dateFormat: config.dateFormat || {
        short: 'd/m/Y',
        long: 'd/m/Y H:i',
      },
    };
  }
}

/**
 * Get current locale config
 * @returns {Object|null}
 */
export function getLocaleConfig() {
  if (!localeConfig) return null;
  return localeConfig;
}

/**
 * Format a number using current locale
 * @param {number} number
 * @param {Object} options
 * @returns {string}
 */
export function formatNumber(number, options = {}) {
  const numValue = parseFloat(number);
  if (isNaN(numValue)) {
    return '0,00';
  }

  const config = getLocaleConfig();

  // Minimal fallback when no config yet
  if (!config) {
    return numValue
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  const showDecimals = config?.showDecimals !== false;
  const defaultOptions = {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
    ...options,
  };

  try {
    return new Intl.NumberFormat(config.locale, defaultOptions).format(numValue);
  } catch (error) {
    // Manual fallback
    return numValue
      .toFixed(defaultOptions.minimumFractionDigits)
      .replace('.', config.numberFormat.decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, config.numberFormat.thousands);
  }
}

/**
 * Format a currency using current settings (symbol + position)
 * @param {number} amount
 * @param {Object} options
 * @returns {string}
 */
export function formatCurrency(amount, options = {}) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return '0,00';
  }

  const config = getLocaleConfig();
  // Fallback with temporary symbol while waiting for initialization
  if (!config) {
    const formatted = numAmount
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} F CFA`;
  }

  // Format numeric part, then apply symbol/position from settings
  const opt = options && typeof options === 'object' ? options : {};
  const showDecimalsC = config?.showDecimals !== false;
  const digits = {
    minimumFractionDigits: opt.minimumFractionDigits ?? (showDecimalsC ? 2 : 0),
    maximumFractionDigits: opt.maximumFractionDigits ?? (showDecimalsC ? 2 : 0),
  };
  const formattedNumber = formatNumber(numAmount, digits);

  return config.currencyPosition === 'before'
    ? `${config.currencySymbol}${formattedNumber}`
    : `${formattedNumber} ${config.currencySymbol}`;
}

/**
 * Format a date using current locale
 * @param {Date|string} date
 * @param {Object} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const config = getLocaleConfig();
  const dateObj = date instanceof Date ? date : new Date(date);

  if (!config) {
    return dateObj.toLocaleDateString();
  }

  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(config.locale, defaultOptions).format(dateObj);
  } catch (error) {
    // Simple fallback
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format a date and time using current locale
 * @param {Date|string} date
 * @param {Object} options
 * @returns {string}
 */
export function formatDateTime(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return formatDate(date, defaultOptions);
}

/**
 * Format a percentage using current locale
 * @param {number} value - 0.15 for 15%
 * @param {Object} options
 * @returns {string}
 */
export function formatPercent(value, options = {}) {
  const config = getLocaleConfig();

  if (!config) {
    return `${(value * 100).toFixed(2)}%`;
  }

  const defaultOptions = {
    style: 'percent',
    minimumFractionDigits: 2,
    ...options,
  };

  try {
    return new Intl.NumberFormat(config.locale, defaultOptions).format(value);
  } catch (error) {
    return `${(value * 100).toFixed(2)}%`;
  }
}

/**
 * Whether current locale uses RTL
 * @returns {boolean}
 */
export function isRTL() {
  const config = getLocaleConfig();
  return config ? !!config.rtl : false;
}

/**
 * Get current language
 * @returns {string}
 */
export function getCurrentLanguage() {
  const config = getLocaleConfig();
  return config ? config.language : 'français';
}

/**
 * Get current locale code
 * @returns {string}
 */
export function getCurrentLocale() {
  const config = getLocaleConfig();
  return config ? config.locale : 'fr-FR';
}

/**
 * Get current currency code
 * @returns {string}
 */
export function getCurrentCurrency() {
  const config = getLocaleConfig();
  return config ? config.currency : 'XOF';
}

/**
 * Get current currency symbol
 * @returns {string}
 */
export function getCurrentCurrencySymbol() {
  const config = getLocaleConfig();
  return config ? config.currencySymbol : 'F CFA';
}

/**
 * Compare two numbers with locale sensitivity
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function compareNumbers(a, b) {
  const config = getLocaleConfig();
  try {
    const locale = config ? config.locale : 'fr-FR';
    return new Intl.Collator(locale, { numeric: true }).compare(a, b);
  } catch (error) {
    return a - b;
  }
}

/**
 * Compare two strings with locale sensitivity
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareStrings(a, b) {
  const config = getLocaleConfig();
  try {
    const locale = config ? config.locale : 'fr-FR';
    return new Intl.Collator(locale).compare(a, b);
  } catch (error) {
    return a.localeCompare(b);
  }
}

export default {
  initLocale,
  getLocaleConfig,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  isRTL,
  getCurrentLanguage,
  getCurrentLocale,
  getCurrentCurrency,
  getCurrentCurrencySymbol,
  compareNumbers,
  compareStrings,
};
