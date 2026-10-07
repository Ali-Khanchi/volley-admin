import { MONTHS, daysInMonth, yearRange } from '../lib/dateParts'
import { inputClass } from './FormAtoms'

export function DateFields({
  day,
  month,
  year,
  onChange,
}: {
  day: number
  month: number
  year: number
  onChange: (next: { day: number; month: number; year: number }) => void
}) {
  const maxDay = daysInMonth(month, year)
  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        value={day}
        onChange={(e) => onChange({ day: Number(e.target.value), month, year })}
        className={inputClass}
      >
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => {
          const newMonth = Number(e.target.value)
          onChange({ day: Math.min(day, daysInMonth(newMonth, year)), month: newMonth, year })
        }}
        className={inputClass}
      >
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => {
          const newYear = Number(e.target.value)
          onChange({ day: Math.min(day, daysInMonth(month, newYear)), month, year: newYear })
        }}
        className={inputClass}
      >
        {yearRange().map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
