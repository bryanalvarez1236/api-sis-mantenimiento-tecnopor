import { ServiceError } from '../services'

const INVALID_DATE = 'Invalid Date'

export function validateDate(date?: string | Date) {
  const validDate = new Date(date as string)
  if (date == null || validDate.toString() === INVALID_DATE) {
    throw new ServiceError({
      status: 400,
      message:
        'La fecha indicada es inválida el formato para la fecha es "MM/DD/YYYY" o "MM/DD/YYYY HH:mm:ss"',
    })
  }
  return validDate
}
