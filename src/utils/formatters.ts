/**
 * Formats a number as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats a number as a percentage
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero'
  }).format(value / 100);
};

/**
 * Formats a large number with k/m/b suffixes
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(value);
};

/**
 * Formats a date string to a more readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Returns the appropriate CSS class based on whether a value is positive or negative
 */
export const getProfitLossClass = (value: number): string => {
  if (value > 0) return 'profit';
  if (value < 0) return 'loss';
  return 'text-neutral-400';
};

/**
 * Adds + sign to positive numbers
 */
export const formatWithSign = (value: number): string => {
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
};