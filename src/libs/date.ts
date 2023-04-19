export function validateDate(date?: string | Date) {
  if (date == null) {
    return false
  }
  date = new Date(date)
  return date.toString() === 'Invalid Date' ? false : date
}
