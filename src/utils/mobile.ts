export function normalizeMobile(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}
