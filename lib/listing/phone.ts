/** Store Malaysian numbers as E.164 without spaces or hyphens, e.g. +601160765514 */
export function normalizeMalaysiaPhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) {
    return '';
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('60')) {
    return `+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `+60${digits.slice(1)}`;
  }

  return `+60${digits}`;
}
