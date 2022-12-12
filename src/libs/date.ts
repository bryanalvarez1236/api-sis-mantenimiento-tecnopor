const BOLIVIAN_TIME_ZONE = 'America/La_Paz'

export function getDateBoliviaTimeZone() {
  const now = new Date()
  const boliviaTimeZone = new Date(
    now.toLocaleString('en-US', { timeZone: BOLIVIAN_TIME_ZONE })
  )
  return boliviaTimeZone
}
