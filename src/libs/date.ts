import { ServiceError } from '../services'

const INVALID_DATE = 'Invalid Date'
export const INVALID_DATE_MESSAGE =
  'La fecha indicada es inválida el formato para la fecha es "MM/DD/YYYY" o "MM/DD/YYYY HH:mm:ss"'
export function validateDate(date?: string | Date) {
  const validDate = new Date(date as string)
  if (date == null || validDate.toString() === INVALID_DATE) {
    throw new ServiceError({
      status: 400,
      message: INVALID_DATE_MESSAGE,
    })
  }
  return validDate
}

export const RANGES = {
  WEEKLY: (year: number, month: number, day: number) => {
    const weekDay = new Date(year, month, day).getDay()
    const firstWeekDay = day - weekDay
    const lastWeekDay = firstWeekDay + 6
    const gte = new Date(year, month, firstWeekDay)
    const lte = new Date(year, month, lastWeekDay, 23, 59, 59)
    return { gte, lte }
  },
  MONTHLY: (year: number, month: number) => {
    const monthDays = new Date(year, month + 1, 0).getDate()
    const gte = new Date(year, month, 1)
    const lte = new Date(year, month, monthDays, 23, 59, 59)
    return { gte, lte }
  },
  ANNUAL: (year: number) => {
    const gte = new Date(year, 0)
    const lte = new Date(year, 12, 31, 23, 59, 59)
    return { gte, lte }
  },
}
