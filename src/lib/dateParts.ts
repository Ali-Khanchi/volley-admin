export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

export function yearRange(span = 5): number[] {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current - 2; y <= current + span; y++) years.push(y)
  return years
}

export function partsToIsoDate(day: number, month: number, year: number): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`
}

export function isoDateToParts(iso: string | null): { day: number; month: number; year: number } | null {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return null
  return { day, month, year }
}
